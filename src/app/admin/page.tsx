import Link from "next/link";

import { loadActiveSeasonTournaments } from "@/lib/competition/database/loadTournamentPages";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const tournaments = await loadActiveSeasonTournaments();

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-amber-400">
            Admin
          </p>

          <h1 className="mt-3 text-4xl font-black">Competition control room</h1>

          <p className="mt-3 max-w-2xl text-zinc-400">
            Manage tournament draws, mentor drafts, match scores, and
            progression.
          </p>
        </div>

        <form action="/api/admin/logout" method="post">
          <button
            type="submit"
            className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-300 hover:border-zinc-500"
          >
            Sign out
          </button>
        </form>
      </div>

      {tournaments.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
            Tournament status
          </p>

          <h2 className="mt-3 text-2xl font-black">
            No active-season tournaments found
          </h2>

          <p className="mt-3 text-zinc-400">
            Create a new season before using the competition control room.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tournaments.map((tournament) => (
            <Link
              key={tournament.id}
              href={`/admin/tournaments/${tournament.id}`}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-amber-400/50"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                  Tournament {tournament.id}
                </p>

                <span className="rounded-full border border-zinc-700 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                  {tournament.status}
                </span>
              </div>

              <h2 className="mt-2 text-xl font-black">{tournament.game}</h2>

              <p className="mt-1 text-sm text-zinc-500">{tournament.name}</p>

              <p className="mt-3 text-sm text-zinc-400">
                Best of {tournament.bestOf}
              </p>

              <p className="mt-3 text-sm text-zinc-400">
                Open management screen
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
