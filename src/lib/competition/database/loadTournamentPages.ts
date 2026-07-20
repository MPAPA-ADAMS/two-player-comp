
import prisma from "@/lib/prisma";
import type {
  Player,
  Tournament,
} from "@/types/competition";

function parseBestOf(
  value: number,
): Tournament["bestOf"] {
  if (
    value === 1 ||
    value === 3 ||
    value === 5
  ) {
    return value;
  }

  throw new Error(
    `Invalid tournament bestOf value: ${value}`,
  );
}

function mapTournament(
  tournament: {
    id: number;
    name: string;
    game: string;
    bestOf: number;
    status: Tournament["status"];
  },
): Tournament {
  return {
    id: tournament.id,
    name: tournament.name,
    game: tournament.game,
    bestOf:parseBestOf(
      tournament.bestOf,
    ),
    status: tournament.status,
  };
}

function mapPlayer(
  player: {
    id: string;
    name: string;
    shortName: string;
    colour: string;
  },
): Player {
  return {
    id: player.id,
    name: player.name,
    shortName: player.shortName,
    colour: player.colour,
  };
}

export async function loadActiveSeasonTournaments(): Promise<
  Tournament[]
> {
  const season = await prisma.season.findFirst({
    where: {
      isActive: true,
    },
    orderBy: {
      number: "desc",
    },
    select: {
      tournaments: {
        orderBy: {
          id: "asc",
        },
        select: {
          id: true,
          name: true,
          game: true,
          bestOf: true,
          status: true,
        },
      },
    },
  });

  return season?.tournaments.map(mapTournament) ?? [];
}

export async function loadCompetitionPlayers(): Promise<
  Player[]
> {
  const players = await prisma.player.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      shortName: true,
      colour: true,
    },
  });

  return players.map(mapPlayer);
}

export async function loadTournamentPageData(
  tournamentId: number,
): Promise<{
  tournament: Tournament | null;
  tournaments: Tournament[];
  players: Player[];
}> {
  const [tournaments, players] =
    await Promise.all([
      loadActiveSeasonTournaments(),
      loadCompetitionPlayers(),
    ]);

  const tournament =
    tournaments.find(
      (item) => item.id === tournamentId,
    ) ?? null;

  return {
    tournament,
    tournaments,
    players,
  };
}

