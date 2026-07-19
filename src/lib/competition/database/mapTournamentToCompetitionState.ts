import type {
  CompetitionState,
  GroupName,
} from "@/lib/competition/engine";
import type { FixtureRound } from "@/lib/competition/fixture";
import {
  createMentorDraft,
  type MentorDraft,
} from "@/lib/competition/mentors";
import type {
  Match,
  Player,
} from "@/types/competition";

type DatabasePlayer = Player;

type DatabaseGroupEntry = {
  seed: number;
  player: DatabasePlayer;
};

type DatabaseGroup = {
  id: string;
  name: string;
  entries: DatabaseGroupEntry[];
};

type DatabaseMatch = {
  id: string;
  tournamentId: number;
  groupId: string | null;
  stage: Match["stage"];
  round: number;
  player1Rounds: number;
  player2Rounds: number;
  completed: boolean;
  playedAt?: Date | null;
  player1: DatabasePlayer;
  player2: DatabasePlayer;
};

type DatabaseDraftTurn = {
  pickNumber: number;
  mentorId: string;
};

type DatabaseDraftPick = {
  pickNumber: number;
  mentorId: string;
  playerId: string;
};

type DatabaseMentorDraft = {
  completed: boolean;
  turns: DatabaseDraftTurn[];
  picks: DatabaseDraftPick[];
};

export type TournamentForCompetitionState = {
  id: number;
  groups: DatabaseGroup[];
  matches: DatabaseMatch[];
  mentorDraft: DatabaseMentorDraft | null;
};

export function mapTournamentToCompetitionState(
  tournament: TournamentForCompetitionState,
): CompetitionState {
  const groupA = findGroup(
    tournament.groups,
    "A",
  );

  const groupB = findGroup(
    tournament.groups,
    "B",
  );

  const groupAPlayers = mapGroupPlayers(groupA);
  const groupBPlayers = mapGroupPlayers(groupB);

  const groupMatches = tournament.matches.filter(
    (match) => match.stage === "GROUP",
  );

  const groupAFixtures = mapGroupFixtures(
    groupMatches.filter(
      (match) => match.groupId === groupA?.id,
    ),
  );

  const groupBFixtures = mapGroupFixtures(
    groupMatches.filter(
      (match) => match.groupId === groupB?.id,
    ),
  );

  const semifinals = tournament.matches
    .filter(
      (match) => match.stage === "SEMIFINAL",
    )
    .sort(compareMatches)
    .map(mapMatch);

  const finalRecord =
    tournament.matches
      .filter(
        (match) => match.stage === "FINAL",
      )
      .sort(compareMatches)[0] ?? null;

  return {
    tournamentId: tournament.id,
    groupAPlayers,
    groupBPlayers,
    groupAFixtures,
    groupBFixtures,
    semifinals,
    finalMatch: finalRecord
      ? mapMatch(finalRecord)
      : null,
    mentorDraft: mapMentorDraft(
      tournament.id,
      tournament.mentorDraft,
    ),
  };
}

function findGroup(
  groups: DatabaseGroup[],
  name: GroupName,
): DatabaseGroup | null {
  return (
    groups.find(
      (group) =>
        group.name.toUpperCase() === name,
    ) ?? null
  );
}

function mapGroupPlayers(
  group: DatabaseGroup | null,
): Player[] {
  if (!group) {
    return [];
  }

  return [...group.entries]
    .sort(
      (entryA, entryB) =>
        entryA.seed - entryB.seed,
    )
    .map((entry) => entry.player);
}

function mapGroupFixtures(
  matches: DatabaseMatch[],
): FixtureRound[] {
  const matchesByRound = new Map<
    number,
    DatabaseMatch[]
  >();

  for (const match of matches) {
    const existing =
      matchesByRound.get(match.round) ?? [];

    existing.push(match);
    matchesByRound.set(
      match.round,
      existing,
    );
  }

  return [...matchesByRound.entries()]
    .sort(
      ([roundA], [roundB]) =>
        roundA - roundB,
    )
    .map(([number, roundMatches]) => ({
      number,
      matches: roundMatches
        .sort(compareMatches)
        .map(mapMatch),
    }));
}

function mapMatch(
  match: DatabaseMatch,
): Match {
  return {
    id: match.id,
    round: match.round,
    stage: match.stage,
    player1: match.player1,
    player2: match.player2,
    player1Rounds: match.player1Rounds,
    player2Rounds: match.player2Rounds,
    completed: match.completed,
  };
}

function mapMentorDraft(
  tournamentId: number,
  draft: DatabaseMentorDraft | null,
): MentorDraft | null {
  if (!draft) {
    return null;
  }

  /*
   * mentorOrder is deterministic from the tournament ID.
   * pickOrder is stored relationally in MentorDraftTurn.
   */
  const generatedDraft =
    createMentorDraft(tournamentId);

  const turns = [...draft.turns].sort(
    (turnA, turnB) =>
      turnA.pickNumber -
      turnB.pickNumber,
  );

  const picks = [...draft.picks]
    .sort(
      (pickA, pickB) =>
        pickA.pickNumber -
        pickB.pickNumber,
    )
    .map((pick) => ({
      pickNumber: pick.pickNumber,
      mentorId: pick.mentorId,
      playerId: pick.playerId,
    }));

  return {
    mentorOrder:
      generatedDraft.mentorOrder,
    pickOrder: turns.map(
      (turn) => turn.mentorId,
    ),
    picks,
    completed: draft.completed,
  };
}

function compareMatches(
  matchA: DatabaseMatch,
  matchB: DatabaseMatch,
): number {
  return (
    matchA.round - matchB.round ||
    matchA.id.localeCompare(matchB.id)
  );
}