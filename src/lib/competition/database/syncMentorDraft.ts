import type { Prisma } from "@/generated/prisma/client";

import type { CompetitionState } from "@/lib/competition/engine";
import type { MentorDraft } from "@/lib/competition/mentors";

type TransactionClient = Prisma.TransactionClient;

export async function syncMentorDraft(
  transaction: TransactionClient,
  state: CompetitionState,
): Promise<void> {
  const tournamentId = state.tournamentId;
  const draftId = createDraftId(tournamentId);
  const draft = state.mentorDraft as MentorDraft | null | undefined;

  if (!draft) {
    await transaction.mentorDraft.deleteMany({
      where: {
        tournamentId,
      },
    });

    return;
  }

  validateDraft(draft, tournamentId);

  await assertMentorsExist(
    transaction,
    draft,
  );

  await assertDraftPlayersExist(
    transaction,
    draft,
  );

  const savedDraft = await transaction.mentorDraft.upsert({
    where: {
      tournamentId,
    },
    create: {
      id: draftId,
      tournamentId,
      completed: draft.completed,
    },
    update: {
      completed: draft.completed,
    },
  });

  /*
   * Delete child records before recreating them.
   *
   * This prevents stale turns or picks when a draft is reset,
   * corrected, or regenerated.
   */
  await transaction.mentorDraftPick.deleteMany({
    where: {
      draftId: savedDraft.id,
    },
  });

  await transaction.mentorDraftTurn.deleteMany({
    where: {
      draftId: savedDraft.id,
    },
  });

  if (draft.pickOrder.length > 0) {
    await transaction.mentorDraftTurn.createMany({
      data: draft.pickOrder.map((mentorId, index) => ({
        id: createTurnId(
          tournamentId,
          index + 1,
        ),
        draftId: savedDraft.id,
        pickNumber: index + 1,
        mentorId,
      })),
    });
  }

  if (draft.picks.length > 0) {
    await transaction.mentorDraftPick.createMany({
      data: draft.picks.map((pick) => ({
        id: createPickId(
          tournamentId,
          pick.pickNumber,
        ),
        draftId: savedDraft.id,
        pickNumber: pick.pickNumber,
        mentorId: pick.mentorId,
        playerId: pick.playerId,
      })),
    });
  }
}

function validateDraft(
  draft: MentorDraft,
  tournamentId: number,
): void {
  const uniqueMentorOrder = new Set(
    draft.mentorOrder,
  );

  if (
    uniqueMentorOrder.size !==
    draft.mentorOrder.length
  ) {
    throw new Error(
      `Tournament ${tournamentId} mentor order contains duplicate mentors.`,
    );
  }

  if (draft.pickOrder.length === 0) {
    throw new Error(
      `Tournament ${tournamentId} mentor draft has no pick order.`,
    );
  }

  if (
    draft.picks.length >
    draft.pickOrder.length
  ) {
    throw new Error(
      `Tournament ${tournamentId} has more mentor picks than draft turns.`,
    );
  }

  const expectedPickNumbers = draft.picks.map(
    (_, index) => index + 1,
  );

  const actualPickNumbers = draft.picks.map(
    (pick) => pick.pickNumber,
  );

  const hasInvalidSequence =
    actualPickNumbers.some(
      (pickNumber, index) =>
        pickNumber !== expectedPickNumbers[index],
    );

  if (hasInvalidSequence) {
    throw new Error(
      `Tournament ${tournamentId} mentor picks are not sequential.`,
    );
  }

  const playerIds = draft.picks.map(
    (pick) => pick.playerId,
  );

  if (
    new Set(playerIds).size !==
    playerIds.length
  ) {
    throw new Error(
      `Tournament ${tournamentId} mentor draft contains duplicate players.`,
    );
  }

  for (const pick of draft.picks) {
    const expectedMentorId =
      draft.pickOrder[pick.pickNumber - 1];

    if (pick.mentorId !== expectedMentorId) {
      throw new Error(
        `Tournament ${tournamentId} pick ${pick.pickNumber} belongs to ${pick.mentorId}, but the draft order expects ${expectedMentorId}.`,
      );
    }
  }

  const shouldBeCompleted =
    draft.picks.length ===
    draft.pickOrder.length;

  if (draft.completed !== shouldBeCompleted) {
    throw new Error(
      `Tournament ${tournamentId} mentor draft completion state is inconsistent.`,
    );
  }
}

async function assertMentorsExist(
  transaction: TransactionClient,
  draft: MentorDraft,
): Promise<void> {
  const mentorIds = [
    ...new Set([
      ...draft.mentorOrder,
      ...draft.pickOrder,
      ...draft.picks.map(
        (pick) => pick.mentorId,
      ),
    ]),
  ];

  const existingMentors =
    await transaction.mentor.findMany({
      where: {
        id: {
          in: mentorIds,
        },
      },
      select: {
        id: true,
      },
    });

  const existingMentorIds = new Set(
    existingMentors.map(
      (mentor) => mentor.id,
    ),
  );

  const missingMentorIds =
    mentorIds.filter(
      (mentorId) =>
        !existingMentorIds.has(mentorId),
    );

  if (missingMentorIds.length > 0) {
    throw new Error(
      `Cannot synchronize mentor draft because these mentors do not exist: ${missingMentorIds.join(
        ", ",
      )}.`,
    );
  }
}

async function assertDraftPlayersExist(
  transaction: TransactionClient,
  draft: MentorDraft,
): Promise<void> {
  const playerIds = [
    ...new Set(
      draft.picks.map(
        (pick) => pick.playerId,
      ),
    ),
  ];

  if (playerIds.length === 0) {
    return;
  }

  const existingPlayers =
    await transaction.player.findMany({
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
    existingPlayers.map(
      (player) => player.id,
    ),
  );

  const missingPlayerIds =
    playerIds.filter(
      (playerId) =>
        !existingPlayerIds.has(playerId),
    );

  if (missingPlayerIds.length > 0) {
    throw new Error(
      `Cannot synchronize mentor draft because these players do not exist: ${missingPlayerIds.join(
        ", ",
      )}.`,
    );
  }
}

function createDraftId(
  tournamentId: number,
): string {
  return `tournament-${tournamentId}-mentor-draft`;
}

function createTurnId(
  tournamentId: number,
  pickNumber: number,
): string {
  return `tournament-${tournamentId}-mentor-turn-${pickNumber}`;
}

function createPickId(
  tournamentId: number,
  pickNumber: number,
): string {
  return `tournament-${tournamentId}-mentor-pick-${pickNumber}`;
}