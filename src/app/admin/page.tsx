import Link from "next/link";
import { tournaments } from "@/lib/mockData";

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-amber-400">Admin</p>
          <h1 className="mt-3 text-4xl font-black">Competition control room</h1>
          <p className="mt-3 max-w-2xl text-zinc-400">Manage tournament draws, mentor drafts, match scores, and progression.</p>
        </div>
        <form action="/api/admin/logout" method="post"><button className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-300 hover:border-zinc-500">Sign out</button></form>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tournaments.map((tournament) => (
          <Link key={tournament.id} href={`/admin/tournaments/${tournament.id}`} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-amber-400/50">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Tournament {tournament.id}</p>
            <h2 className="mt-2 text-xl font-black">{tournament.game}</h2>
            <p className="mt-3 text-sm text-zinc-400">Open management screen</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
