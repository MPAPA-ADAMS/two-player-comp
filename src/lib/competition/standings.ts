import type { Match, Player } from "@/types/competition";
import type { FixtureRound } from "@/lib/competition/fixture";

export type StandingRow = {
  position: number;
  player: Player;
  played: number;
  wins: number;
  losses: number;
  roundsWon: number;
  roundsLost: number;
  roundDifference: number;
  points: number;
};

export function calculateStandings(
  players: Player[],
  fixtureRounds: FixtureRound[],
): StandingRow[] {
  const matches = fixtureRounds.flatMap((round) => round.matches);

  const standings = players.map((player) =>
    calculatePlayerStanding(player, matches),
  );

  const sortedStandings = [...standings].sort(compareStandingRows);

  return sortedStandings.map((standing, index) => ({
    ...standing,
    position: index + 1,
  }));
}

function calculatePlayerStanding(
  player: Player,
  matches: Match[],
): StandingRow {
  const playerMatches = matches.filter(
    (match) =>
      match.completed &&
      (match.player1.id === player.id ||
        match.player2.id === player.id),
  );

  let wins = 0;
  let losses = 0;
  let roundsWon = 0;
  let roundsLost = 0;

  for (const match of playerMatches) {
    const isPlayerOne = match.player1.id === player.id;

    const playerRounds = isPlayerOne
      ? match.player1Rounds
      : match.player2Rounds;

    const opponentRounds = isPlayerOne
      ? match.player2Rounds
      : match.player1Rounds;

    roundsWon += playerRounds;
    roundsLost += opponentRounds;

    if (playerRounds > opponentRounds) {
      wins += 1;
    } else {
      losses += 1;
    }
  }

  return {
    position: 0,
    player,
    played: playerMatches.length,
    wins,
    losses,
    roundsWon,
    roundsLost,
    roundDifference: roundsWon - roundsLost,
    points: wins,
  };
}

function compareStandingRows(
  first: StandingRow,
  second: StandingRow,
): number {
  if (second.wins !== first.wins) {
    return second.wins - first.wins;
  }

  if (second.roundDifference !== first.roundDifference) {
    return second.roundDifference - first.roundDifference;
  }

  if (second.roundsWon !== first.roundsWon) {
    return second.roundsWon - first.roundsWon;
  }

  return first.player.name.localeCompare(second.player.name);
}