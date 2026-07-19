import { NextResponse } from "next/server";

import { getRelationalTournament } from "@/lib/competition/queries/get-relational-tournament";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const tournamentId = Number(id);

    if (
      !Number.isInteger(tournamentId) ||
      tournamentId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid tournament ID.",
        },
        {
          status: 400,
        },
      );
    }

    const tournament =
      await getRelationalTournament(tournamentId);

    if (!tournament) {
      return NextResponse.json(
        {
          error: `Tournament ${tournamentId} was not found.`,
        },
        {
          status: 404,
        },
      );
    }

    const groupMatches = tournament.matches.filter(
      (match) => match.stage === "GROUP",
    );

    const semifinalMatches = tournament.matches.filter(
      (match) => match.stage === "SEMIFINAL",
    );

    const finalMatch =
      tournament.matches.find(
        (match) => match.stage === "FINAL",
      ) ?? null;

    const tiebreakMatches = tournament.matches.filter(
      (match) => match.stage === "TIEBREAK",
    );

    return NextResponse.json({
      tournament: {
        id: tournament.id,
        name: tournament.name,
        game: tournament.game,
        bestOf: tournament.bestOf,
        status: tournament.status,
        createdAt: tournament.createdAt,
        updatedAt: tournament.updatedAt,
        season: tournament.season,
      },

      groups: tournament.groups,

      bracket: {
        semifinals: semifinalMatches,
        final: finalMatch,
      },

      matches: {
        all: tournament.matches,
        group: groupMatches,
        semifinals: semifinalMatches,
        final: finalMatch,
        tiebreaks: tiebreakMatches,
      },

      mentorDraft: tournament.mentorDraft,
    });
  } catch (error) {
    console.error(
      "Failed to load relational tournament:",
      error,
    );

    return NextResponse.json(
      {
        error: "Unable to load tournament.",
      },
      {
        status: 500,
      },
    );
  }
}
