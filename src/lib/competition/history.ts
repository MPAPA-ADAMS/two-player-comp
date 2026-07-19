import type { CompetitionState } from "@/lib/competition/engine";
import type { Tournament } from "@/types/competition";
import type { TournamentHistory } from "@/types/tournament-history";

export function createTournamentHistoryFromState(
  tournament: Tournament,
  state: CompetitionState,
): TournamentHistory | null {
  if (
    state.tournamentId !== tournament.id ||
    state.groupAPlayers.length !== 4 ||
    state.groupBPlayers.length !== 4 ||
    state.semifinals.length !== 2 ||
    !state.finalMatch?.completed
  ) {
    return null;
  }

  return {
    tournament: {
      ...tournament,
      status: "COMPLETED",
    },
    groupA: {
      players: state.groupAPlayers,
      matches: state.groupAFixtures.flatMap((round) => round.matches),
    },
    groupB: {
      players: state.groupBPlayers,
      matches: state.groupBFixtures.flatMap((round) => round.matches),
    },
    semifinals: state.semifinals,
    final: state.finalMatch,
    mentorDraft: state.mentorDraft ?? null,
  };
}
