import { NextResponse } from "next/server";

import {
  loadCompetitionStateFromDatabase,
} from "@/lib/competition/database/loadCompetitionStateFromDatabase";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const seasons = await prisma.season.findMany({
    select: {
      id: true,
      name: true,
      isActive: true,
      _count: {
        select: {
          tournaments: true,
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });

  const tournaments =
    await prisma.tournament.findMany({
      where: {
        season: {
          isActive: true,
        },
      },
      select: {
        id: true,
        name: true,
        seasonId: true,
        status: true,
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

  const records = states.flatMap((state) =>
    state
      ? [
          {
            tournamentId: state.tournamentId,
            state,
          },
        ]
      : [],
  );

  return NextResponse.json({
    diagnostic: {
      build: "competition-diagnostic-1",
      environment:
        process.env.VERCEL_ENV ?? "unknown",
      seasons,
      activeTournaments: tournaments,
      loadedStateCount: records.length,
    },
    records,
  });
}