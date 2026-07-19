import type { CompetitionState } from "@/lib/competition/engine";
import type { Prisma } from "@/generated/prisma/client";

type TransactionClient = Prisma.TransactionClient;

type GroupPlayerValue =
  | string
  | {
      id?: unknown;
      playerId?: unknown;
    };

export async function syncGroups(
  transaction: TransactionClient,
  state: CompetitionState,
): Promise<void> {
  const groupAPlayerIds = extractPlayerIds(
    state.groupAPlayers as GroupPlayerValue[],
    "A",
  );

  const groupBPlayerIds = extractPlayerIds(
    state.groupBPlayers as GroupPlayerValue[],
    "B",
  );

  const groupsGenerated =
    groupAPlayerIds.length === 4 &&
    groupBPlayerIds.length === 4;

  /*
   * Always clear existing entries first. This prevents stale seeds or players
   * surviving after a redraw.
   */
  await transaction.groupEntry.deleteMany({
    where: {
      group: {
        tournamentId: state.tournamentId,
      },
    },
  });

  if (!groupsGenerated) {
    /*
     * A reset or incomplete draw should remove the normalized groups.
     *
     * Existing matches are not deleted here. Match synchronization will handle
     * those in the next phase.
     */
    await transaction.tournamentGroup.deleteMany({
      where: {
        tournamentId: state.tournamentId,
      },
    });

    return;
  }

  validateUniquePlayers([
    ...groupAPlayerIds,
    ...groupBPlayerIds,
  ]);

  await assertPlayersExist(
    transaction,
    [...groupAPlayerIds, ...groupBPlayerIds],
  );

  const groupAId = createGroupId(
    state.tournamentId,
    "A",
  );

  const groupBId = createGroupId(
    state.tournamentId,
    "B",
  );

  await transaction.tournamentGroup.upsert({
    where: {
      tournamentId_name: {
        tournamentId: state.tournamentId,
        name: "A",
      },
    },
    update: {
      id: groupAId,
    },
    create: {
      id: groupAId,
      tournamentId: state.tournamentId,
      name: "A",
    },
  });

  await transaction.tournamentGroup.upsert({
    where: {
      tournamentId_name: {
        tournamentId: state.tournamentId,
        name: "B",
      },
    },
    update: {
      id: groupBId,
    },
    create: {
      id: groupBId,
      tournamentId: state.tournamentId,
      name: "B",
    },
  });

  await transaction.groupEntry.createMany({
    data: [
      ...createGroupEntries(
        groupAId,
        groupAPlayerIds,
      ),
      ...createGroupEntries(
        groupBId,
        groupBPlayerIds,
      ),
    ],
  });
}

function extractPlayerIds(
  values: GroupPlayerValue[],
  groupName: "A" | "B",
): string[] {
  return values.map((value, index) => {
    const playerId = getPlayerId(value);

    if (!playerId) {
      throw new Error(
        `Group ${groupName} player at position ${
          index + 1
        } does not have a valid player ID.`,
      );
    }

    return playerId;
  });
}

function getPlayerId(
  value: GroupPlayerValue,
): string | null {
  if (typeof value === "string") {
    return value.trim() || null;
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    if (
      typeof value.id === "string" &&
      value.id.trim()
    ) {
      return value.id;
    }

    if (
      typeof value.playerId === "string" &&
      value.playerId.trim()
    ) {
      return value.playerId;
    }
  }

  return null;
}

function validateUniquePlayers(
  playerIds: string[],
): void {
  const uniquePlayerIds = new Set(playerIds);

  if (uniquePlayerIds.size !== playerIds.length) {
    throw new Error(
      "A player cannot appear more than once across tournament groups.",
    );
  }
}

async function assertPlayersExist(
  transaction: TransactionClient,
  playerIds: string[],
): Promise<void> {
  const players = await transaction.player.findMany({
    where: {
      id: {
        in: playerIds,
      },
    },
    select: {
      id: true,
    },
  });

  const existingIds = new Set(
    players.map((player) => player.id),
  );

  const missingIds = playerIds.filter(
    (playerId) => !existingIds.has(playerId),
  );

  if (missingIds.length > 0) {
    throw new Error(
      `Cannot synchronize groups because these players do not exist: ${missingIds.join(
        ", ",
      )}.`,
    );
  }
}

function createGroupId(
  tournamentId: number,
  groupName: "A" | "B",
): string {
  return `tournament-${tournamentId}-group-${groupName.toLowerCase()}`;
}

function createGroupEntries(
  groupId: string,
  playerIds: string[],
) {
  return playerIds.map((playerId, index) => ({
    id: `${groupId}-player-${playerId}`,
    groupId,
    playerId,
    seed: index + 1,
  }));
}