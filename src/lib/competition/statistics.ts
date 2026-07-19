import type { CompetitionState } from "@/lib/competition/engine";
import { calculateSeasonStandings } from "@/lib/competition/season";
import type { Match } from "@/types/competition";

export type CompetitionStatistics = {
  tournamentsStarted: number;
  tournamentsCompleted: number;
  matchesCompleted: number;
  groupMatchesCompleted: number;
  knockoutMatchesCompleted: number;
  roundsPlayed: number;
  averageRoundsPerMatch: number;
  sweeps: number;
  decidingMatches: number;
  highestWinRatePlayer: string | null;
  mostRoundsWonPlayer: string | null;
};

export function calculateCompetitionStatistics(
  states: CompetitionState[],
): CompetitionStatistics {
  const matches = states.flatMap(getCompletedMatches);
  const groupMatches = states.flatMap((state) =>
    [
      ...state.groupAFixtures.flatMap((round) => round.matches),
      ...state.groupBFixtures.flatMap((round) => round.matches),
    ].filter((match) => match.completed),
  );
  const knockoutMatches = states.flatMap((state) =>
    [...state.semifinals, ...(state.finalMatch ? [state.finalMatch] : [])].filter(
      (match) => match.completed,
    ),
  );
  const roundsPlayed = matches.reduce(
    (total, match) => total + match.player1Rounds + match.player2Rounds,
    0,
  );
  const standings = calculateSeasonStandings(states);
  const highestWinRate = [...standings]
    .filter((row) => row.matchWins + row.matchLosses > 0)
    .sort((a, b) => {
      const aRate = a.matchWins / (a.matchWins + a.matchLosses);
      const bRate = b.matchWins / (b.matchWins + b.matchLosses);
      return bRate - aRate || b.matchWins - a.matchWins;
    })[0];
  const mostRoundsWon = [...standings].sort(
    (a, b) => b.roundsWon - a.roundsWon,
  )[0];

  return {
    tournamentsStarted: states.filter(
      (state) => state.groupAPlayers.length === 4 && state.groupBPlayers.length === 4,
    ).length,
    tournamentsCompleted: states.filter((state) => state.finalMatch?.completed).length,
    matchesCompleted: matches.length,
    groupMatchesCompleted: groupMatches.length,
    knockoutMatchesCompleted: knockoutMatches.length,
    roundsPlayed,
    averageRoundsPerMatch: matches.length === 0 ? 0 : roundsPlayed / matches.length,
    sweeps: matches.filter(isSweep).length,
    decidingMatches: matches.filter(isDecidingMatch).length,
    highestWinRatePlayer: highestWinRate?.player.name ?? null,
    mostRoundsWonPlayer: mostRoundsWon?.player.name ?? null,
  };
}

function getCompletedMatches(state: CompetitionState): Match[] {
  return [
    ...state.groupAFixtures.flatMap((round) => round.matches),
    ...state.groupBFixtures.flatMap((round) => round.matches),
    ...state.semifinals,
    ...(state.finalMatch ? [state.finalMatch] : []),
  ].filter((match) => match.completed);
}

function isSweep(match: Match): boolean {
  return Math.min(match.player1Rounds, match.player2Rounds) === 0;
}

function isDecidingMatch(match: Match): boolean {
  return Math.abs(match.player1Rounds - match.player2Rounds) === 1;
}
