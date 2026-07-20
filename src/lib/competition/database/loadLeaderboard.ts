import prisma from "@/lib/prisma";
import type { Player } from "@/types/competition";

const TOURNAMENT_WIN_POINTS = 6;
const RUNNER_UP_POINTS = 3;
const SEMIFINAL_POINTS = 1;

export type SeasonStanding = {
  player: Player;
  tournamentPoints: number[];
  tournamentWins: number;
  runnerUpFinishes: number;
  semifinalFinishes: number;
};

type MatchResult = {
  completed: boolean;
  player1Rounds: number;
  player2Rounds: number;
  player1: Player;
  player2: Player;
};

function getWinner(
  match: MatchResult,
): Player | null {
  if (!match.completed) {
    return null;
  }

  if (
    match.player1Rounds ===
    match.player2Rounds
  ) {
    return null;
  }

  return match.player1Rounds >
    match.player2Rounds
    ? match.player1
    : match.player2;
}

function getLoser(
  match: MatchResult,
): Player | null {
  if (!match.completed) {
    return null;
  }

  if (
    match.player1Rounds ===
    match.player2Rounds
  ) {
    return null;
  }

  return match.player1Rounds <
    match.player2Rounds
    ? match.player1
    : match.player2;
}

export async function loadLeaderboard(): Promise<{
  seasonName: string;
  tournamentCount: number;
  standings: SeasonStanding[];
}> {
  const season = await prisma.season.findFirst({
    where: {
      isActive: true,
    },
    orderBy: {
      number: "desc",
    },
    include: {
      tournaments: {
        orderBy: {
          id: "asc",
        },
        include: {
          matches: {
            where: {
              stage: {
                in: [
                  "SEMIFINAL",
                  "FINAL",
                ],
              },
              completed: true,
            },
            include: {
              player1: true,
              player2: true,
            },
            orderBy: [
              {
                stage: "asc",
              },
              {
                round: "asc",
              },
              {
                id: "asc",
              },
            ],
          },
        },
      },
    },
  });

  const players = await prisma.player.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const tournamentCount =
    season?.tournaments.length ?? 0;

  const standingsByPlayerId = new Map<
    string,
    SeasonStanding
  >();

  for (const player of players) {
    standingsByPlayerId.set(player.id, {
      player,
      tournamentPoints:
        Array.from(
          {
            length: tournamentCount,
          },
          () => 0,
        ),
      tournamentWins: 0,
      runnerUpFinishes: 0,
      semifinalFinishes: 0,
    });
  }

  if (!season) {
    return {
      seasonName: "No active season",
      tournamentCount: 0,
      standings: [
        ...standingsByPlayerId.values(),
      ],
    };
  }

  season.tournaments.forEach(
    (tournament, tournamentIndex) => {
      const finalMatch =
        tournament.matches.find(
          (match) =>
            match.stage === "FINAL",
        );

      if (!finalMatch) {
        return;
      }

      const winner = getWinner(finalMatch);
      const runnerUp = getLoser(finalMatch);

      if (!winner || !runnerUp) {
        return;
      }

      const winnerStanding =
        standingsByPlayerId.get(winner.id);

      if (winnerStanding) {
        winnerStanding.tournamentPoints[
          tournamentIndex
        ] = TOURNAMENT_WIN_POINTS;

        winnerStanding.tournamentWins += 1;
      }

      const runnerUpStanding =
        standingsByPlayerId.get(
          runnerUp.id,
        );

      if (runnerUpStanding) {
        runnerUpStanding.tournamentPoints[
          tournamentIndex
        ] = RUNNER_UP_POINTS;

        runnerUpStanding.runnerUpFinishes += 1;
      }

      const semifinalMatches =
        tournament.matches.filter(
          (match) =>
            match.stage === "SEMIFINAL",
        );

      for (const semifinal of semifinalMatches) {
        const semifinalLoser =
          getLoser(semifinal);

        if (!semifinalLoser) {
          continue;
        }

        const semifinalStanding =
          standingsByPlayerId.get(
            semifinalLoser.id,
          );

        if (!semifinalStanding) {
          continue;
        }

        semifinalStanding.tournamentPoints[
          tournamentIndex
        ] = SEMIFINAL_POINTS;

        semifinalStanding.semifinalFinishes += 1;
      }
    },
  );

  const standings = [
    ...standingsByPlayerId.values(),
  ].sort((standingA, standingB) => {
    const totalA =
      getTotal(
        standingA.tournamentPoints,
      );

    const totalB =
      getTotal(
        standingB.tournamentPoints,
      );

    return (
      totalB - totalA ||
      standingB.tournamentWins -
        standingA.tournamentWins ||
      standingB.runnerUpFinishes -
        standingA.runnerUpFinishes ||
      standingB.semifinalFinishes -
        standingA.semifinalFinishes ||
      standingA.player.name.localeCompare(
        standingB.player.name,
      )
    );
  });

  return {
    seasonName: season.name,
    tournamentCount,
    standings,
  };
}

function getTotal(points: number[]): number {
  return points.reduce(
    (total, value) => total + value,
    0,
  );
}
