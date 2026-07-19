import type { Match } from "@/types/competition";

export function canEditGroupMatches(
  semifinals: Match[],
) {
  return !semifinals.some(
    (match) => match.completed,
  );
}

export function canEditSemifinals(
  finalMatch: Match | null,
) {
  return !finalMatch?.completed;
}

export function canEditFinal(
  nextTournamentGenerated: boolean,
) {
  return !nextTournamentGenerated;
}