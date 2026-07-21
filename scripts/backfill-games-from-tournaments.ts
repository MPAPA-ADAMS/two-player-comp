import "dotenv/config";

import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

import prisma from "../src/lib/prisma";

async function main(): Promise<void> {
  const season = await prisma.season.findFirst({
    where: {
      isActive: true,
    },
    include: {
      games: true,
      tournaments: {
        orderBy: {
          id: "asc",
        },
      },
    },
  });

  if (!season) {
    throw new Error("No active season exists.");
  }

  if (season.tournaments.length === 0) {
    throw new Error(
      `Season "${season.name}" has no tournaments.`,
    );
  }

  const existingGameNames = new Set(
    season.games.map((game) =>
      game.name.trim().toLocaleLowerCase(),
    ),
  );

  const missingGameNames = [
    ...new Map(
      season.tournaments
        .map((tournament) => tournament.game.trim())
        .filter(Boolean)
        .map((gameName) => [
          gameName.toLocaleLowerCase(),
          gameName,
        ]),
    ).values(),
  ].filter(
    (gameName) =>
      !existingGameNames.has(
        gameName.toLocaleLowerCase(),
      ),
  );

  if (missingGameNames.length === 0) {
    console.log(
      `All games already exist for ${season.name}.`,
    );

    return;
  }

  await prisma.game.createMany({
    data: missingGameNames.map((name) => ({
      name,
      seasonId: season.id,
    })),
  });

  console.log(
    `Created ${missingGameNames.length} game(s) for ${season.name}:`,
  );

  for (const gameName of missingGameNames) {
    console.log(`- ${gameName}`);
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