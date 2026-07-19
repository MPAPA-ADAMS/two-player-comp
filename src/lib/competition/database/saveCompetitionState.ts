
import { TournamentStatus } from "@/generated/prisma/client";

import type { CompetitionState } from "@/lib/competition/engine";
import { syncGroups } from "@/lib/competition/database/syncGroups";
import { syncMatches } from "@/lib/competition/database/syncMatches";
import { syncMentorDraft } from "@/lib/competition/database/syncMentorDraft";
import prisma from "@/lib/prisma";


export async function saveCompetitionStateToDatabase(
  state: CompetitionState,
) {
  return prisma.$transaction(
    async (transaction) => {
      const status =
        getTournamentStatus(state);

      const tournamentUpdate =
        await transaction.tournament.updateMany({
          where: {
            id: state.tournamentId,
          },
          data: {
            status,
          },
        });

      if (tournamentUpdate.count !== 1) {
        throw new Error(
          `Normalized tournament ${state.tournamentId} does not exist.`,
        );
      }

      await syncGroups(transaction, state);
      await syncMatches(transaction, state);
      await syncMentorDraft(
        transaction,
        state,
      );

      return {
        normalizedTournamentUpdated: true,
        status,
      };
    },
  );
}

function getTournamentStatus(
  state: CompetitionState,
): TournamentStatus {
  if (state.finalMatch?.completed) {
    return TournamentStatus.COMPLETED;
  }

  const hasStarted =
    state.groupAPlayers.length > 0 ||
    state.groupBPlayers.length > 0 ||
    state.groupAFixtures.length > 0 ||
    state.groupBFixtures.length > 0 ||
    state.semifinals.length > 0 ||
    state.finalMatch !== null ||
    state.mentorDraft !== null;

  return hasStarted
    ? TournamentStatus.IN_PROGRESS
    : TournamentStatus.LOCKED;
}