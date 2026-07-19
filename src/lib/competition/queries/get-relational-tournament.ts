import prisma from "@/lib/prisma";

export async function getRelationalTournament(tournamentId: number) {
  return prisma.tournament.findUnique({
    where: {
      id: tournamentId,
    },
    include: {
      season: {
        select: {
          id: true,
          name: true,
          number: true,
          isActive: true,
        },
      },

      groups: {
        orderBy: {
          name: "asc",
        },
        include: {
          entries: {
            orderBy: {
              seed: "asc",
            },
            include: {
              player: true,
            },
          },
        },
      },

      matches: {
        orderBy: [
          {
            stage: "asc",
          },
          {
            round: "asc",
          },
          {
            id: "asc",
          },
        ],
        include: {
          group: {
            select: {
              id: true,
              name: true,
            },
          },
          player1: true,
          player2: true,
          winner: true,
        },
      },

      mentorDraft: {
        include: {
          turns: {
            orderBy: {
              pickNumber: "asc",
            },
            include: {
              mentor: true,
            },
          },

          picks: {
            orderBy: {
              pickNumber: "asc",
            },
            include: {
              mentor: true,
              player: true,
            },
          },
        },
      },
    },
  });
}

export type RelationalTournament = NonNullable<
  Awaited<ReturnType<typeof getRelationalTournament>>
>;