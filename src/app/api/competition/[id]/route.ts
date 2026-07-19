import { NextRequest, NextResponse } from "next/server";

import { loadCompetitionStateFromDatabase } from "@/lib/competition/database/loadCompetitionStateFromDatabase";
import { saveCompetitionStateToDatabase } from "@/lib/competition/database/saveCompetitionState";
import type { CompetitionState } from "@/lib/competition/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseTournamentId(value: string): number | null {
  const id = Number(value);

  return Number.isInteger(id) && id >= 1 && id <= 8
    ? id
    : null;
}

function isAdmin(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;

  return Boolean(
    secret &&
      request.cookies.get("ta_admin")?.value === secret,
  );
}

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  const { id: rawId } = await context.params;
  const tournamentId = parseTournamentId(rawId);

  if (!tournamentId) {
    return NextResponse.json(
      { error: "Invalid tournament ID." },
      { status: 400 },
    );
  }

  const state =
    await loadCompetitionStateFromDatabase(
      tournamentId,
    );

  if (!state) {
    return NextResponse.json(
      { error: "Tournament not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    tournamentId,
    state,
    source: "normalized",
  });
}

export async function PUT(
  request: NextRequest,
  context: RouteContext,
) {
  if (!isAdmin(request)) {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 401 },
    );
  }

  const { id: rawId } = await context.params;
  const tournamentId = parseTournamentId(rawId);

  if (!tournamentId) {
    return NextResponse.json(
      { error: "Invalid tournament ID." },
      { status: 400 },
    );
  }

  let body: { state?: CompetitionState };

  try {
    body = (await request.json()) as {
      state?: CompetitionState;
    };
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 },
    );
  }

  if (
    !body.state ||
    body.state.tournamentId !== tournamentId
  ) {
    return NextResponse.json(
      { error: "Invalid competition state." },
      { status: 400 },
    );
  }

  try {
    const result =
      await saveCompetitionStateToDatabase(
        body.state,
      );

    return NextResponse.json({
      ok: true,
      normalized: {
        tournamentUpdated:
          result.normalizedTournamentUpdated,
        status: result.status,
      },
    });
  } catch (error) {
    console.error(
      `Failed to save tournament ${tournamentId}:`,
      error,
    );

    return NextResponse.json(
      { error: "Unable to save competition state." },
      { status: 500 },
    );
  }
}