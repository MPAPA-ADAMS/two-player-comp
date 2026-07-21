import { generateFinal, generateSemifinals } from "@/lib/competition/bracket";
import type { GeneratedGroups } from "@/lib/competition/draw";
import {
  canEditFinal,
  canEditGroupMatches,
  canEditSemifinals,
} from "@/lib/competition/editing";
import {
  generateGroupFixtures,
  type FixtureRound,
} from "@/lib/competition/fixture";
import {
  calculateStandings,
  type StandingRow,
} from "@/lib/competition/standings";
import { addMentorDraftPick, createMentorDraft, type MentorDraft } from "@/lib/competition/mentors";
import type { Match, Player, Tournament } from "@/types/competition";

export type GroupName = "A" | "B";

export type CompetitionState = {
  tournamentId: Tournament["id"];
  groupAPlayers: Player[];
  groupBPlayers: Player[];
  groupAFixtures: FixtureRound[];
  groupBFixtures: FixtureRound[];
  semifinals: Match[];
  finalMatch: Match | null;
  mentorDraft?: MentorDraft | null;
  mentorDraftSkipped?: boolean;
};

export type CompetitionAction =
  | {
      type: "HYDRATE";
      state: CompetitionState;
    }
  | {
      type: "RESET";
      tournamentId: Tournament["id"];
    }
  | {
      type: "DRAW_COMPLETED";
      groups: GeneratedGroups;
    }
  | {
      type: "MENTOR_PLAYER_DRAFTED";
      playerId: Player["id"];
    }
  | {
      type: "GROUP_RESULT_RECORDED";
      group: GroupName;
      match: Match;
    }
  | {
      type: "SEMIFINAL_RESULT_RECORDED";
      match: Match;
    }
  | {
      type: "FINAL_RESULT_RECORDED";
      match: Match;
      nextTournamentGenerated: boolean;
    };

export type CompetitionView = {
  groupAStandings: StandingRow[];
  groupBStandings: StandingRow[];
  groupsGenerated: boolean;
  groupAComplete: boolean;
  groupBComplete: boolean;
  groupStageComplete: boolean;
  semifinalsComplete: boolean;
  tournamentComplete: boolean;
  mentorDraftComplete: boolean;
  groupMatchesEditable: boolean;
  semifinalsEditable: boolean;
  finalEditable: boolean;
};

export function createCompetitionState(
  tournamentId: Tournament["id"],
): CompetitionState {
  return {
    tournamentId,
    groupAPlayers: [],
    groupBPlayers: [],
    groupAFixtures: [],
    groupBFixtures: [],
    semifinals: [],
    finalMatch: null,
    mentorDraft: null,
    mentorDraftSkipped: false,
  };
}

export function competitionReducer(
  state: CompetitionState,
  action: CompetitionAction,
): CompetitionState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;

    case "RESET":
      return createCompetitionState(action.tournamentId);

    case "DRAW_COMPLETED":
      return applyDraw(state, action.groups);

    case "MENTOR_PLAYER_DRAFTED":
      return recordMentorDraftPick(state, action.playerId);

    case "GROUP_RESULT_RECORDED":
      return recordGroupResult(state, action.group, action.match);

    case "SEMIFINAL_RESULT_RECORDED":
      return recordSemifinalResult(state, action.match);

    case "FINAL_RESULT_RECORDED":
      return recordFinalResult(
        state,
        action.match,
        action.nextTournamentGenerated,
      );

    default:
      return state;
  }
}

export function getCompetitionView(
  state: CompetitionState,
  nextTournamentGenerated: boolean,
): CompetitionView {
  const groupAStandings = calculateStandings(
    state.groupAPlayers,
    state.groupAFixtures,
  );
  const groupBStandings = calculateStandings(
    state.groupBPlayers,
    state.groupBFixtures,
  );

  const groupsGenerated =
    state.groupAPlayers.length === 4 && state.groupBPlayers.length === 4;
  const groupAComplete = isGroupComplete(state.groupAFixtures);
  const groupBComplete = isGroupComplete(state.groupBFixtures);
  const groupStageComplete = groupAComplete && groupBComplete;
  const semifinalsComplete =
    state.semifinals.length === 2 &&
    state.semifinals.every((match) => match.completed);
  const tournamentComplete = state.finalMatch?.completed ?? false;
  const mentorDraftComplete = state.mentorDraftSkipped === true || state.mentorDraft?.completed === true;

  return {
    groupAStandings,
    groupBStandings,
    groupsGenerated,
    groupAComplete,
    groupBComplete,
    groupStageComplete,
    semifinalsComplete,
    tournamentComplete,
    mentorDraftComplete,
    groupMatchesEditable: mentorDraftComplete && canEditGroupMatches(state.semifinals),
    semifinalsEditable: canEditSemifinals(state.finalMatch),
    finalEditable: canEditFinal(nextTournamentGenerated),
  };
}

function applyDraw(
  state: CompetitionState,
  groups: GeneratedGroups,
): CompetitionState {
  return {
    ...state,
    groupAPlayers: groups.groupA,
    groupBPlayers: groups.groupB,
    groupAFixtures: generateGroupFixtures(
      groups.groupA,
      "A",
      state.tournamentId,
    ),
    groupBFixtures: generateGroupFixtures(
      groups.groupB,
      "B",
      state.tournamentId,
    ),
    semifinals: [],
    finalMatch: null,
    mentorDraft: createMentorDraft(state.tournamentId),
  };
}

function recordMentorDraftPick(state: CompetitionState, playerId: Player["id"]): CompetitionState {
  if (!state.mentorDraft || state.semifinals.some((match) => match.completed)) return state;
  const allPlayers = [...state.groupAPlayers, ...state.groupBPlayers];
  if (!allPlayers.some((player) => player.id === playerId)) return state;
  return { ...state, mentorDraft: addMentorDraftPick(state.mentorDraft, playerId) };
}

function recordGroupResult(
  state: CompetitionState,
  group: GroupName,
  updatedMatch: Match,
): CompetitionState {
  if (!state.mentorDraft?.completed || !canEditGroupMatches(state.semifinals)) {
    return state;
  }

  const nextState: CompetitionState = {
    ...state,
    groupAFixtures:
      group === "A"
        ? replaceMatch(state.groupAFixtures, updatedMatch)
        : state.groupAFixtures,
    groupBFixtures:
      group === "B"
        ? replaceMatch(state.groupBFixtures, updatedMatch)
        : state.groupBFixtures,
  };

  // Correcting a group result may change the qualifiers. An unplayed bracket
  // is discarded and immediately rebuilt from the corrected standings.
  if (
    nextState.semifinals.length > 0 &&
    nextState.semifinals.every((match) => !match.completed)
  ) {
    nextState.semifinals = [];
    nextState.finalMatch = null;
  }

  return generateMissingSemifinals(nextState);
}

function recordSemifinalResult(
  state: CompetitionState,
  updatedMatch: Match,
): CompetitionState {
  if (!canEditSemifinals(state.finalMatch)) {
    return state;
  }

  const nextState: CompetitionState = {
    ...state,
    semifinals: state.semifinals.map((match) =>
      match.id === updatedMatch.id ? updatedMatch : match,
    ),
    // A corrected semifinal may change a finalist.
    finalMatch: null,
  };

  return generateMissingFinal(nextState);
}

function recordFinalResult(
  state: CompetitionState,
  updatedMatch: Match,
  nextTournamentGenerated: boolean,
): CompetitionState {
  if (!canEditFinal(nextTournamentGenerated)) {
    return state;
  }

  return {
    ...state,
    finalMatch: updatedMatch,
  };
}

function generateMissingSemifinals(
  state: CompetitionState,
): CompetitionState {
  if (
    state.semifinals.length > 0 ||
    !isGroupComplete(state.groupAFixtures) ||
    !isGroupComplete(state.groupBFixtures)
  ) {
    return state;
  }

  const generated = generateSemifinals(
    calculateStandings(state.groupAPlayers, state.groupAFixtures),
    calculateStandings(state.groupBPlayers, state.groupBFixtures),
    state.tournamentId,
  );

  return {
    ...state,
    semifinals: [generated.semifinal1, generated.semifinal2],
  };
}

function generateMissingFinal(state: CompetitionState): CompetitionState {
  if (
    state.finalMatch !== null ||
    state.semifinals.length !== 2 ||
    !state.semifinals.every((match) => match.completed)
  ) {
    return state;
  }

  return {
    ...state,
    finalMatch: generateFinal(
      state.semifinals[0],
      state.semifinals[1],
      state.tournamentId,
    ),
  };
}

function replaceMatch(
  rounds: FixtureRound[],
  updatedMatch: Match,
): FixtureRound[] {
  return rounds.map((round) => ({
    ...round,
    matches: round.matches.map((match) =>
      match.id === updatedMatch.id ? updatedMatch : match,
    ),
  }));
}

function isGroupComplete(rounds: FixtureRound[]): boolean {
  const matches = rounds.flatMap((round) => round.matches);

  return matches.length === 6 && matches.every((match) => match.completed);
}
