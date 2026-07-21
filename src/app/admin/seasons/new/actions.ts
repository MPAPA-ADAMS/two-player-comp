"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  TournamentStatus,
  type Prisma,
} from "@/generated/prisma/client";
import type { SeasonSetupInput } from "@/lib/competition/admin/seasonSetup";
import prisma from "@/lib/prisma";

const REQUIRED_PLAYER_COUNT = 8;

export async function createSeason(
  input: SeasonSetupInput,
): Promise<never> {
  const seasonName = input.name.trim();

  const games = normalizeNames(input.games);
  const mentorNames = normalizeNames(input.mentors);
  const players = normalizePlayers(input.players);

  validateSeasonSetup({
    seasonName,
    seasonNumber: input.number,
    games,
    mentorNames,
    players,
  });

  const season = await prisma.$transaction(
    async (transaction) => {
      /*
       * Only one season should be active at a time.
       */
      await transaction.season.updateMany({
        where: {
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      /*
       * Players and mentors are global records in the current schema.
       * Deactivate the previous roster before activating the new one.
       */
      await transaction.player.updateMany({
        where: {
          active: true,
        },
        data: {
          active: false,
        },
      });

      await transaction.mentor.updateMany({
        where: {
          active: true,
        },
        data: {
          active: false,
        },
      });

      const createdSeason =
        await transaction.season.create({
          data: {
            name: seasonName,
            number: input.number,
            isActive: true,
          },
        });

      await createSeasonGames({
        transaction,
        seasonId: createdSeason.id,
        games,
      });

      await activateOrCreateMentors({
        transaction,
        mentorNames,
      });

      await activateOrCreatePlayers({
        transaction,
        players,
      });

      await createSeasonTournaments({
        transaction,
        seasonId: createdSeason.id,
        games,
      });

      return createdSeason;
    },
  );

  revalidatePath("/");
  revalidatePath("/players");
  revalidatePath("/mentors");
  revalidatePath("/leaderboard");
  revalidatePath("/tournaments");
  revalidatePath("/admin");
  revalidatePath("/admin/seasons");

  redirect(`/admin/seasons/${season.id}`);
}

function validateSeasonSetup({
  seasonName,
  seasonNumber,
  games,
  mentorNames,
  players,
}: {
  seasonName: string;
  seasonNumber: number;
  games: string[];
  mentorNames: string[];
  players: SeasonSetupInput["players"];
}): void {
  if (!seasonName) {
    throw new Error("Season name is required.");
  }

  if (
    !Number.isInteger(seasonNumber) ||
    seasonNumber < 1
  ) {
    throw new Error(
      "Season number must be a positive integer.",
    );
  }

  if (games.length === 0) {
    throw new Error(
      "Enter at least one game.",
    );
  }

  if (mentorNames.length === 0) {
    throw new Error(
      "Enter at least one mentor.",
    );
  }

  if (
    players.length !== REQUIRED_PLAYER_COUNT
  ) {
    throw new Error(
      `A season requires exactly ${REQUIRED_PLAYER_COUNT} players.`,
    );
  }

  const shortNames = players.map((player) =>
    player.shortName.toLocaleLowerCase(),
  );

  if (
    new Set(shortNames).size !==
    shortNames.length
  ) {
    throw new Error(
      "Every player must have a unique short name.",
    );
  }
}

async function createSeasonGames({
  transaction,
  seasonId,
  games,
}: {
  transaction: Prisma.TransactionClient;
  seasonId: number;
  games: string[];
}): Promise<void> {
  await transaction.game.createMany({
    data: games.map((name) => ({
      name,
      seasonId,
    })),
  });
}

async function createSeasonTournaments({
  transaction,
  seasonId,
  games,
}: {
  transaction: Prisma.TransactionClient;
  seasonId: number;
  games: string[];
}): Promise<void> {
  await transaction.tournament.createMany({
    data: games.map((game, index) => ({
      seasonId,
      name: `${game} Tournament`,
      game,
      bestOf: 3,
      status:
        index === 0
          ? TournamentStatus.READY
          : TournamentStatus.LOCKED,
    })),
  });
}

async function activateOrCreateMentors({
  transaction,
  mentorNames,
}: {
  transaction: Prisma.TransactionClient;
  mentorNames: string[];
}): Promise<void> {
  const existingMentors =
    await transaction.mentor.findMany({
      select: {
        id: true,
        name: true,
      },
    });

  const existingByName = new Map(
    existingMentors.map((mentor) => [
      mentor.name.toLocaleLowerCase(),
      mentor,
    ]),
  );

  const mentorIdsToActivate: string[] = [];
  const mentorNamesToCreate: string[] = [];

  for (const name of mentorNames) {
    const existingMentor =
      existingByName.get(
        name.toLocaleLowerCase(),
      );

    if (existingMentor) {
      mentorIdsToActivate.push(
        existingMentor.id,
      );
    } else {
      mentorNamesToCreate.push(name);
    }
  }

  if (mentorIdsToActivate.length > 0) {
    await transaction.mentor.updateMany({
      where: {
        id: {
          in: mentorIdsToActivate,
        },
      },
      data: {
        active: true,
      },
    });
  }

  if (mentorNamesToCreate.length > 0) {
    await transaction.mentor.createMany({
      data: mentorNamesToCreate.map(
        (name) => ({
          name,
          active: true,
        }),
      ),
    });
  }
}

async function activateOrCreatePlayers({
  transaction,
  players,
}: {
  transaction: Prisma.TransactionClient;
  players: SeasonSetupInput["players"];
}): Promise<void> {
  const existingPlayers =
    await transaction.player.findMany({
      select: {
        id: true,
        name: true,
      },
    });

  const existingByName = new Map(
    existingPlayers.map((player) => [
      player.name.toLocaleLowerCase(),
      player,
    ]),
  );

  for (const player of players) {
    const existingPlayer =
      existingByName.get(
        player.name.toLocaleLowerCase(),
      );

    if (existingPlayer) {
      await transaction.player.update({
        where: {
          id: existingPlayer.id,
        },
        data: {
          name: player.name,
          shortName: player.shortName,
          colour: player.colour,
          active: true,
        },
      });

      continue;
    }

    await transaction.player.create({
      data: {
        name: player.name,
        shortName: player.shortName,
        colour: player.colour,
        active: true,
      },
    });
  }
}

function normalizeNames(
  values: string[],
): string[] {
  const uniqueNames = new Map<
    string,
    string
  >();

  for (const value of values) {
    const name = value.trim();

    if (!name) {
      continue;
    }

    const key = name.toLocaleLowerCase();

    if (!uniqueNames.has(key)) {
      uniqueNames.set(key, name);
    }
  }

  return [...uniqueNames.values()];
}

function normalizePlayers(
  values: SeasonSetupInput["players"],
): SeasonSetupInput["players"] {
  const uniquePlayers = new Map<
    string,
    SeasonSetupInput["players"][number]
  >();

  for (const value of values) {
    const name = value.name.trim();
    const shortName =
      value.shortName.trim();
    const colour = value.colour.trim();

    if (!name) {
      continue;
    }

    if (!shortName) {
      throw new Error(
        `Short name is required for ${name}.`,
      );
    }

    if (!colour) {
      throw new Error(
        `Colour is required for ${name}.`,
      );
    }

    const key = name.toLocaleLowerCase();

    if (!uniquePlayers.has(key)) {
      uniquePlayers.set(key, {
        name,
        shortName,
        colour,
      });
    }
  }

  return [...uniquePlayers.values()];
}
