import "dotenv/config";


import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

import {
  TournamentStatus,
} from "../src/generated/prisma/client";
import prisma from "../src/lib/prisma";

async function main(): Promise<void> {
  const season = await prisma.season.findFirst({
    where: {
      isActive: true,
    },
    include: {
      games: {
        orderBy: {
          id: "asc",
        },
      },
      tournaments: {
        orderBy: {
          id: "asc",
        },
      },
    },
  });

  if (!season) {
    throw new Error(
      "No active season exists. Create the season before generating tournaments.",
    );
  }

  if (season.games.length === 0) {
    throw new Error(
      `Season "${season.name}" has no games.`,
    );
  }

  const existingGameNames = new Set(
    season.tournaments.map((tournament) =>
      tournament.game.trim().toLocaleLowerCase(),
    ),
  );

  const missingGames = season.games.filter(
    (game) =>
      !existingGameNames.has(
        game.name.trim().toLocaleLowerCase(),
      ),
  );

  if (missingGames.length === 0) {
    console.log(
      `All ${season.games.length} tournaments already exist for ${season.name}.`,
    );

    printTournamentSummary(
      season.tournaments,
    );

    return;
  }

  const existingTournamentCount =
    season.tournaments.length;

  await prisma.tournament.createMany({
    data: missingGames.map((game, index) => {
      const tournamentPosition =
        existingTournamentCount + index;

      return {
        seasonId: season.id,
        name: `${game.name} Tournament`,
        game: game.name,
        bestOf: 3,

        /*
         * Only the first tournament is initially available.
         * Every later tournament remains locked.
         */
        status:
          tournamentPosition === 0
            ? TournamentStatus.READY
            : TournamentStatus.LOCKED,
      };
    }),
  });

  const tournaments =
    await prisma.tournament.findMany({
      where: {
        seasonId: season.id,
      },
      orderBy: {
        id: "asc",
      },
    });

  console.log(
    `Created ${missingGames.length} missing tournament(s) for ${season.name}.`,
  );

  printTournamentSummary(tournaments);
}

function printTournamentSummary(
  tournaments: Array<{
    id: number;
    name: string;
    status: TournamentStatus;
  }>,
): void {
  console.log("");

  for (const [index, tournament] of tournaments.entries()) {
    console.log(
      `${index + 1}. ${tournament.name} — ` +
      `database ID ${tournament.id} — ` +
      tournament.status,
    );
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });