import { loadCompetitionState } from "@/lib/competition/storage";
import type { Tournament, TournamentStatus } from "@/types/competition";

export const COMPETITION_PROGRESS_EVENT = "competition-progress-changed";

export function isTournamentComplete(tournament: Tournament): boolean {
  if (tournament.status === "COMPLETED") {
    return true;
  }

  const state = loadCompetitionState(tournament.id);
  return state?.finalMatch?.completed ?? false;
}

export function getEffectiveTournamentStatuses(
  tournaments: Tournament[],
): Map<Tournament["id"], TournamentStatus> {
  const statuses = new Map<Tournament["id"], TournamentStatus>();
  let previousTournamentComplete = true;

  for (const tournament of [...tournaments].sort((a, b) => a.id - b.id)) {
    const state = loadCompetitionState(tournament.id);
    const completed =
      tournament.status === "COMPLETED" ||
      (state?.finalMatch?.completed ?? false);

    let status: TournamentStatus;

    if (completed) {
      status = "COMPLETED";
    } else if (!previousTournamentComplete) {
      status = "LOCKED";
    } else if (state && state.groupAPlayers.length === 4) {
      status = "IN_PROGRESS";
    } else {
      status = "READY";
    }

    statuses.set(tournament.id, status);
    previousTournamentComplete = completed;
  }

  return statuses;
}

export function getEffectiveTournamentStatus(
  tournament: Tournament,
  tournaments: Tournament[],
): TournamentStatus {
  return getEffectiveTournamentStatuses(tournaments).get(tournament.id) ?? "LOCKED";
}
