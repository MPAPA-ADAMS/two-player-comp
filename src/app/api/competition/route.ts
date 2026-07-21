import { NextResponse } from "next/server";

import {
  loadCompetitionStateFromDatabase,
} from "@/lib/competition/database/loadCompetitionStateFromDatabase";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const tournaments =
  await prisma.tournament.findMany({
    where: {
      season: {
        isActive: true,
      },
    },
    select: {
      id: true,
    },
    orderBy: {
      id: "asc",
    },
  });

const states = await Promise.all(
  tournaments.map((tournament) =>
    loadCompetitionStateFromDatabase(
      tournament.id,
    ),
  ),
);

  const records = states
    .filter(
      (state): state is NonNullable<typeof state> =>
        state !== null,
    )
    .map((state) => ({
      tournamentId: state.tournamentId,
      state,
    }));

  return NextResponse.json({ records });
}