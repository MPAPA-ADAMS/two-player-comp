import type { CompetitionState } from "@/lib/competition/engine";
import prisma from "@/lib/prisma";
import { mapTournamentToCompetitionState } from "@/lib/competition/database/mapTournamentToCompetitionState";

export async function loadCompetitionStateFromDatabase(
  tournamentId: number,
): Promise<CompetitionState | null> {
  const tournament = await prisma.tournament.findUnique({
    where: {
      id: tournamentId,
    },
    include: {
      groups: {
        include: {
          entries: {
            include: {
              player: true,
            },
            orderBy: {
              seed: "asc",
            },
          },
        },
      },
      matches: {
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
        ],
      },
      mentorDraft: {
        include: {
          turns: {
            orderBy: {
              pickNumber: "asc",
            },
          },
          picks: {
            orderBy: {
              pickNumber: "asc",
            },
          },
        },
      },
    },
  });

  if (!tournament) {
    return null;
  }

return mapTournamentToCompetitionState(tournament);}