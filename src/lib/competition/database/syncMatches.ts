import type { Prisma } from "@/generated/prisma/client";

import type { CompetitionState } from "@/lib/competition/engine";

type TransactionClient = Prisma.TransactionClient;

type PlayerValue =
  | string
  | {
      id?: unknown;
      playerId?: unknown;
    };

type MatchValue = {
  id?: unknown;
  player1?: PlayerValue;
  player2?: PlayerValue;
  player1Id?: unknown;
  player2Id?: unknown;
  player1Rounds?: unknown;
  player2Rounds?: unknown;
  completed?: unknown;
  playedAt?: unknown;
};

type FixtureRoundValue = {
  number?: unknown;
  round?: unknown;
  matches?: unknown;
};

type MatchStageValue =
  | "GROUP"
  | "SEMIFINAL"
  | "FINAL"
  | "TIEBREAK";

type NormalizedMatch = {
  id: string;
  tournamentId: number;
  groupId: string | null;
  stage: MatchStageValue;
  round: number;
  player1Id: string;
  player2Id: string;
  player1Rounds: number;
  player2Rounds: number;
  completed: boolean;
  winnerId: string | null;
  playedAt: Date | null;
};

/**
 * Replaces every normalized match belonging to one tournament.
 *
 * This is intentionally a full replacement rather than a diff:
 * each tournament contains very few matches, and replacing them avoids
 * stale scores, winners, fixtures, or bracket records after an edit/reset.
 */
export async function syncMatches(
  transaction: TransactionClient,
  state: CompetitionState,
): Promise<void> {
  const tournamentId = state.tournamentId;

  const normalizedMatches: NormalizedMatch[] = [
    ...normalizeGroupRounds(
      state.groupAFixtures as unknown[],
      tournamentId,
      "A",
    ),

    ...normalizeGroupRounds(
      state.groupBFixtures as unknown[],
      tournamentId,
      "B",
    ),

    ...normalizeKnockoutMatches(
      state.semifinals as unknown[],
      tournamentId,
      "SEMIFINAL",
    ),

    ...normalizeFinalMatch(
      state.finalMatch,
      tournamentId,
    ),
  ];

  validateUniqueMatchIds(normalizedMatches);

  await assertPlayersExist(
    transaction,
    normalizedMatches,
  );

  await transaction.match.deleteMany({
    where: {
      tournamentId,
    },
  });

  if (normalizedMatches.length === 0) {
    return;
  }

  await transaction.match.createMany({
    data: normalizedMatches,
  });
}

function normalizeGroupRounds(
  rounds: unknown[],
  tournamentId: number,
  groupName: "A" | "B",
): NormalizedMatch[] {
  const groupId = createGroupId(
    tournamentId,
    groupName,
  );

  return rounds.flatMap((roundValue, index) => {
    const round = readFixtureRound(
      roundValue,
      index + 1,
    );

    return round.matches.map(
      (matchValue, matchIndex) =>
        normalizeMatch({
          value: matchValue,
          tournamentId,
          groupId,
          stage: "GROUP",
          round: round.number,
          fallbackId: [
            "tournament",
            tournamentId,
            "group",
            groupName.toLowerCase(),
            "round",
            round.number,
            "match",
            matchIndex + 1,
          ].join("-"),
        }),
    );
  });
}

function normalizeKnockoutMatches(
  values: unknown[],
  tournamentId: number,
  stage: "SEMIFINAL" | "TIEBREAK",
): NormalizedMatch[] {
  return values.map((value, index) =>
    normalizeMatch({
      value,
      tournamentId,
      groupId: null,
      stage,
      round: index + 1,
      fallbackId: [
        "tournament",
        tournamentId,
        stage.toLowerCase(),
        index + 1,
      ].join("-"),
    }),
  );
}

function normalizeFinalMatch(
  value: unknown,
  tournamentId: number,
): NormalizedMatch[] {
  if (!isRecord(value)) {
    return [];
  }

  return [
    normalizeMatch({
      value,
      tournamentId,
      groupId: null,
      stage: "FINAL",
      round: 1,
      fallbackId: `tournament-${tournamentId}-final`,
    }),
  ];
}

function normalizeMatch({
  value,
  tournamentId,
  groupId,
  stage,
  round,
  fallbackId,
}: {
  value: unknown;
  tournamentId: number;
  groupId: string | null;
  stage: MatchStageValue;
  round: number;
  fallbackId: string;
}): NormalizedMatch {
  if (!isRecord(value)) {
    throw new Error(
      `Tournament ${tournamentId} contains an invalid ${stage.toLowerCase()} match.`,
    );
  }

  const match = value as MatchValue;

  const player1Id =
    readPlayerId(match.player1) ??
    readString(match.player1Id);

  const player2Id =
    readPlayerId(match.player2) ??
    readString(match.player2Id);

  if (!player1Id || !player2Id) {
    throw new Error(
      `Match ${readString(match.id) ?? fallbackId} does not have two valid players.`,
    );
  }

  if (player1Id === player2Id) {
    throw new Error(
      `Match ${readString(match.id) ?? fallbackId} contains the same player twice.`,
    );
  }

  const player1Rounds = readNonNegativeInteger(
    match.player1Rounds,
  );

  const player2Rounds = readNonNegativeInteger(
    match.player2Rounds,
  );

  const completed = match.completed === true;

  const winnerId = completed
    ? deriveWinnerId({
        player1Id,
        player2Id,
        player1Rounds,
        player2Rounds,
      })
    : null;

  return {
    id: readString(match.id) ?? fallbackId,
    tournamentId,
    groupId,
    stage,
    round,
    player1Id,
    player2Id,
    player1Rounds,
    player2Rounds,
    completed,
    winnerId,
    playedAt: readDate(match.playedAt),
  };
}

function deriveWinnerId({
  player1Id,
  player2Id,
  player1Rounds,
  player2Rounds,
}: {
  player1Id: string;
  player2Id: string;
  player1Rounds: number;
  player2Rounds: number;
}): string {
  if (player1Rounds > player2Rounds) {
    return player1Id;
  }

  if (player2Rounds > player1Rounds) {
    return player2Id;
  }

  throw new Error(
    "A completed match cannot have a tied score.",
  );
}

function readFixtureRound(
  value: unknown,
  fallbackNumber: number,
): {
  number: number;
  matches: unknown[];
} {
  if (!isRecord(value)) {
    throw new Error(
      `Fixture round ${fallbackNumber} is invalid.`,
    );
  }

  const round = value as FixtureRoundValue;

  if (!Array.isArray(round.matches)) {
    throw new Error(
      `Fixture round ${fallbackNumber} has no matches array.`,
    );
  }

  return {
    number:
      readPositiveInteger(round.number) ??
      readPositiveInteger(round.round) ??
      fallbackNumber,
    matches: round.matches,
  };
}

async function assertPlayersExist(
  transaction: TransactionClient,
  matches: NormalizedMatch[],
): Promise<void> {
  const playerIds = [
    ...new Set(
      matches.flatMap((match) => [
        match.player1Id,
        match.player2Id,
      ]),
    ),
  ];

  if (playerIds.length === 0) {
    return;
  }

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

  const existingPlayerIds = new Set(
    players.map((player) => player.id),
  );

  const missingPlayerIds = playerIds.filter(
    (playerId) => !existingPlayerIds.has(playerId),
  );

  if (missingPlayerIds.length > 0) {
    throw new Error(
      `Cannot synchronize matches because these players do not exist: ${missingPlayerIds.join(
        ", ",
      )}.`,
    );
  }
}

function validateUniqueMatchIds(
  matches: NormalizedMatch[],
): void {
  const matchIds = matches.map((match) => match.id);
  const uniqueIds = new Set(matchIds);

  if (matchIds.length !== uniqueIds.size) {
    throw new Error(
      "Tournament state contains duplicate match IDs.",
    );
  }
}

function createGroupId(
  tournamentId: number,
  groupName: "A" | "B",
): string {
  return `tournament-${tournamentId}-group-${groupName.toLowerCase()}`;
}

function readPlayerId(
  value: PlayerValue | undefined,
): string | null {
  if (typeof value === "string") {
    return value.trim() || null;
  }

  if (!isRecord(value)) {
    return null;
  }

  return (
    readString(value.id) ??
    readString(value.playerId)
  );
}

function readString(
  value: unknown,
): string | null {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    return null;
  }

  return value.trim();
}

function readNonNegativeInteger(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 0
  ) {
    return 0;
  }

  return value;
}

function readPositiveInteger(
  value: unknown,
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value <= 0
  ) {
    return null;
  }

  return value;
}

function readDate(
  value: unknown,
): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}