"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { SeasonSetupInput } from "@/lib/competition/admin/seasonSetup";
import prisma from "@/lib/prisma";

export async function createSeason(
  input: SeasonSetupInput,
): Promise<never> {
  const seasonName = input.name.trim();

  const games = normalizeNames(input.games);
  const mentors = normalizeNames(input.mentors);
  const players = normalizePlayers(input.players);

  if (!seasonName) {
    throw new Error("Season name is required.");
  }

  if (!Number.isInteger(input.number) || input.number < 1) {
    throw new Error("Season number must be a positive integer.");
  }

  if (games.length === 0) {
    throw new Error("Enter at least one game.");
  }

  if (mentors.length === 0) {
    throw new Error("Enter at least one mentor.");
  }

  if (players.length < 2) {
    throw new Error("Enter at least two players.");
  }

  const season = await prisma.$transaction(
    async (transaction) => {
      const createdSeason =
        await transaction.season.create({
          data: {
            name: seasonName,
            number: input.number,
          },
        });

      await transaction.game.createMany({
        data: games.map((name) => ({
          name,
          seasonId: createdSeason.id,
        })),
      });

      await transaction.mentor.createMany({
        data: mentors.map((name) => ({
          name,
        })),
      });

      await transaction.player.createMany({
        data: players.map((player) => ({
          name: player.name,
          shortName: player.shortName,
          colour: player.colour,
        })),
      });

      return createdSeason;
    },
  );

  revalidatePath("/");
  revalidatePath("/players");
  revalidatePath("/mentors");
  revalidatePath("/tournaments");
  revalidatePath("/admin/seasons");

  redirect(`/admin/seasons/${season.id}`);
}

function normalizeNames(values: string[]): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

function normalizePlayers(
  players: SeasonSetupInput["players"],
): SeasonSetupInput["players"] {
  const uniquePlayers = new Map<
    string,
    SeasonSetupInput["players"][number]
  >();

  for (const player of players) {
    const name = player.name.trim();
    const shortName = player.shortName.trim();
    const colour = player.colour.trim();

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

  return Array.from(uniquePlayers.values());
}
