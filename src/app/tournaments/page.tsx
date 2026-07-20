import { redirect } from "next/navigation";

import { loadActiveSeasonTournaments } from "@/lib/competition/database/loadTournamentPages";

export const dynamic = "force-dynamic";

export default async function TournamentsPage() {
  const tournaments = await loadActiveSeasonTournaments();

  const activeTournament =
    tournaments.find((tournament) => tournament.status === "IN_PROGRESS") ??
    tournaments.find((tournament) => tournament.status === "READY");

  if (activeTournament) {
    redirect(`/tournaments/${activeTournament.id}`);
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
          Tournament status
        </p>

        <h1 className="mt-3 text-3xl font-black">No active tournament</h1>

        <p className="mt-3 text-zinc-400">
          There is currently no tournament ready or in progress.
        </p>
      </div>
    </main>
  );
}
