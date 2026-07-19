import { NextResponse } from "next/server";

import { loadCompetitionStateFromDatabase } from "@/lib/competition/database/loadCompetitionStateFromDatabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const tournamentIds = Array.from(
    { length: 8 },
    (_, index) => index + 1,
  );

  const states = await Promise.all(
    tournamentIds.map((tournamentId) =>
      loadCompetitionStateFromDatabase(tournamentId),
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