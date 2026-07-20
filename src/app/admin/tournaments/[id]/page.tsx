import Link from "next/link";
import { notFound } from "next/navigation";

import TournamentRuntime from "@/components/tournament/runtime/TournamentRuntime";
import { loadTournamentPageData } from "@/lib/competition/database/loadTournamentPages";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminTournamentPage({ params }: Props) {
  const { id } = await params;
  const tournamentId = Number(id);

  if (!Number.isInteger(tournamentId) || tournamentId < 1) {
    notFound();
  }

  const { tournament, tournaments, players } =
    await loadTournamentPageData(tournamentId);

  if (!tournament) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-amber-400">
            Admin mode
          </p>

          <p className="mt-1 text-sm text-zinc-300">
            Changes made here update the public competition data stored in
            PostgreSQL.
          </p>
        </div>

        <Link
          href="/admin"
          className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-bold uppercase tracking-widest text-zinc-300 transition hover:border-zinc-500"
        >
          Admin dashboard
        </Link>
      </div>

      <TournamentRuntime
        tournament={tournament}
        tournaments={tournaments}
        players={players}
        editable
      />
    </main>
  );
}
