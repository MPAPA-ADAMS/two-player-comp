import type { Match, Player } from "@/types/competition";
import type { StandingRow } from "@/lib/competition/standings";

type TournamentId = string | number;

export type SemifinalMatches = {
  semifinal1: Match;
  semifinal2: Match;
};

export function generateSemifinals(
  groupAStandings: StandingRow[],
  groupBStandings: StandingRow[],
  tournamentId: TournamentId,
): SemifinalMatches {
  if (
    groupAStandings.length < 2 ||
    groupBStandings.length < 2
  ) {
    throw new Error(
      "Both groups must have at least two ranked players.",
    );
  }

  const groupAWinner = groupAStandings[0].player;
  const groupARunnerUp = groupAStandings[1].player;
  const groupBWinner = groupBStandings[0].player;
  const groupBRunnerUp = groupBStandings[1].player;

  return {
    semifinal1: createKnockoutMatch({
      id: `t${tournamentId}-sf1`,
      round: 1,
      stage: "SEMIFINAL",
      player1: groupAWinner,
      player2: groupBRunnerUp,
    }),

    semifinal2: createKnockoutMatch({
      id: `t${tournamentId}-sf2`,
      round: 1,
      stage: "SEMIFINAL",
      player1: groupBWinner,
      player2: groupARunnerUp,
    }),
  };
}

export function generateFinal(
  semifinal1: Match,
  semifinal2: Match,
  tournamentId: TournamentId,
): Match {
  if (!semifinal1.completed || !semifinal2.completed) {
    throw new Error(
      "Both semifinals must be completed before generating the final.",
    );
  }

  const finalist1 = getMatchWinner(semifinal1);
  const finalist2 = getMatchWinner(semifinal2);

  return createKnockoutMatch({
    id: `t${tournamentId}-final`,
    round: 2,
    stage: "FINAL",
    player1: finalist1,
    player2: finalist2,
  });
}

export function getMatchWinner(match: Match): Player {
  if (!match.completed) {
    throw new Error(
      `Match ${match.id} has not been completed.`,
    );
  }

  if (match.player1Rounds > match.player2Rounds) {
    return match.player1;
  }

  if (match.player2Rounds > match.player1Rounds) {
    return match.player2;
  }

  throw new Error(
    `Match ${match.id} does not have a valid winner.`,
  );
}

export function getMatchLoser(match: Match): Player {
  const winner = getMatchWinner(match);

  return winner.id === match.player1.id
    ? match.player2
    : match.player1;
}

type CreateKnockoutMatchArguments = {
  id: string;
  round: number;
  stage: "SEMIFINAL" | "FINAL";
  player1: Player;
  player2: Player;
};

function createKnockoutMatch({
  id,
  round,
  stage,
  player1,
  player2,
}: CreateKnockoutMatchArguments): Match {
  return {
    id,
    round,
    stage,
    player1,
    player2,
    player1Rounds: 0,
    player2Rounds: 0,
    completed: false,
  };
}