"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { calculateSeasonStandings } from "@/lib/competition/season";
import { loadCompetitionStates } from "@/lib/competition/storage";
import type { CompetitionState } from "@/lib/competition/engine";
import type { Tournament } from "@/types/competition";

const TOURNAMENT_IDS = [1, 2, 3, 4, 5, 6, 7, 8] as Tournament["id"][];

export default function PlayersPage() {
  const [states, setStates] = useState<CompetitionState[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStates(loadCompetitionStates(TOURNAMENT_IDS));
    setHydrated(true);
  }, []);

  const players = useMemo(() => calculateSeasonStandings(states), [states]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-amber-400">
          Competitors
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
          Players
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-zinc-400">
          Player profiles and live career totals derived from every saved tournament result.
        </p>
      </header>

      {!hydrated ? (
        <LoadingCard />
      ) : players.length === 0 ? (
        <EmptyCard />
      ) : (
        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {players.map((row) => {
            const matches = row.matchWins + row.matchLosses;
            const winRate = matches === 0 ? 0 : Math.round((row.matchWins / matches) * 100);

            return (
              <article
                key={row.player.id}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition hover:-translate-y-1 hover:border-zinc-700"
              >
                <div className="h-2" style={{ backgroundColor: row.player.colour }} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                        #{row.position} championship
                      </p>
                      <h2 className="mt-2 text-2xl font-black"><Link className="hover:text-amber-300" href={`/players/${row.player.id}`}>{row.player.name}</Link></h2>
                      <p className="mt-1 text-sm text-zinc-500">{row.player.shortName}</p>
                    </div>
                    <span className="rounded-full bg-amber-400 px-3 py-1 text-sm font-black text-zinc-950">
                      {row.tournamentPoints} pts
                    </span>
                  </div>

                  <dl className="mt-6 grid grid-cols-2 gap-3">
                    <PlayerStat label="Titles" value={row.tournamentWins} />
                    <PlayerStat label="Win rate" value={`${winRate}%`} />
                    <PlayerStat label="Match record" value={`${row.matchWins}-${row.matchLosses}`} />
                    <PlayerStat
                      label="Round diff"
                      value={row.roundDifference > 0 ? `+${row.roundDifference}` : row.roundDifference}
                    />
                  </dl>
                  <Link href={`/players/${row.player.id}`} className="mt-5 flex w-full items-center justify-center rounded-xl bg-zinc-800 px-4 py-3 text-sm font-black transition hover:bg-amber-400 hover:text-zinc-950">View detailed profile →</Link>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

function PlayerStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
      <dt className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">{label}</dt>
      <dd className="mt-1 font-black text-zinc-200">{value}</dd>
    </div>
  );
}

function LoadingCard() {
  return <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-400">Loading player records…</div>;
}

function EmptyCard() {
  return <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-400">Player profiles will appear after the first tournament draw is saved.</div>;
}
