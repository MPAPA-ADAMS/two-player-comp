import { getMatchLoser, getMatchWinner } from "@/lib/competition/bracket";
import type { CompetitionState } from "@/lib/competition/engine";
import type { Player, Tournament } from "@/types/competition";

export type Mentor = { id: string; name: string };
export type MentorDraftPick = {
  pickNumber: number;
  mentorId: string;
  playerId: string;
};
export type MentorDraft = {
  mentorOrder: string[];
  pickOrder: string[];
  picks: MentorDraftPick[];
  completed: boolean;
};

export const mentors: Mentor[] = [
  { id: "mentor-1", name: "Sam" },
  { id: "mentor-2", name: "Jason" },
  { id: "mentor-3", name: "Karthi" },
];

export function createMentorDraft(tournamentId: Tournament["id"]): MentorDraft {
  const rotation = (tournamentId - 1) % mentors.length;
  const mentorOrder = [...mentors.slice(rotation), ...mentors.slice(0, rotation)].map(
    (mentor) => mentor.id,
  );

  // Snake order: 1-2-3, 3-2-1, then two picks. The two-pick mentor rotates.
  const twoPlayerMentor = mentorOrder[(tournamentId - 1) % mentorOrder.length];
  const thirdRound = mentorOrder.filter((mentorId) => mentorId !== twoPlayerMentor);
  const pickOrder = [
    ...mentorOrder,
    ...[...mentorOrder].reverse(),
    ...thirdRound,
  ];

  return { mentorOrder, pickOrder, picks: [], completed: false };
}

export function addMentorDraftPick(
  draft: MentorDraft,
  playerId: Player["id"],
): MentorDraft {
  if (draft.completed || draft.picks.some((pick) => pick.playerId === playerId)) {
    return draft;
  }

  const mentorId = draft.pickOrder[draft.picks.length];
  if (!mentorId) return draft;

  const picks = [
    ...draft.picks,
    { pickNumber: draft.picks.length + 1, mentorId, playerId },
  ];

  return { ...draft, picks, completed: picks.length === draft.pickOrder.length };
}

export function getMentorRoster(draft: MentorDraft | null | undefined, mentorId: string) {
  return draft?.picks.filter((pick) => pick.mentorId === mentorId) ?? [];
}

export function calculateMentorTournamentPoints(
  state: CompetitionState,
): Map<string, number> {
  const points = new Map(mentors.map((mentor) => [mentor.id, 0]));
  const draft = state.mentorDraft;
  if (!draft?.completed || !state.finalMatch?.completed) return points;

  const champion = getMatchWinner(state.finalMatch).id;
  const runnerUp = getMatchLoser(state.finalMatch).id;
  const semifinalLosers = state.semifinals
    .filter((match) => match.completed)
    .map((match) => getMatchLoser(match).id);

  for (const pick of draft.picks) {
    const value = pick.playerId === champion ? 6 : pick.playerId === runnerUp ? 3 : semifinalLosers.includes(pick.playerId) ? 1 : 0;
    points.set(pick.mentorId, (points.get(pick.mentorId) ?? 0) + value);
  }

  return points;
}

export type MentorStanding = {
  mentor: Mentor;
  points: number;
  tournamentWins: number;
  bestDraft: number;
};

export function calculateMentorStandings(states: CompetitionState[]): MentorStanding[] {
  const rows = mentors.map((mentor) => ({ mentor, points: 0, tournamentWins: 0, bestDraft: 0 }));

  for (const state of states) {
    if (!state.finalMatch?.completed || !state.mentorDraft?.completed) continue;
    const scores = calculateMentorTournamentPoints(state);
    const best = Math.max(...scores.values());
    for (const row of rows) {
      const score = scores.get(row.mentor.id) ?? 0;
      row.points += score;
      row.bestDraft = Math.max(row.bestDraft, score);
      if (score === best) row.tournamentWins += 1;
    }
  }

  return rows.sort((a, b) => b.points - a.points || b.tournamentWins - a.tournamentWins || b.bestDraft - a.bestDraft || a.mentor.name.localeCompare(b.mentor.name));
}
