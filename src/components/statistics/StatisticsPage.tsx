"use client";

import { useEffect, useMemo, useState } from "react";
import type { CompetitionState } from "@/lib/competition/engine";
import { calculateCompetitionStatistics } from "@/lib/competition/statistics";
import { loadCompetitionStates } from "@/lib/competition/storage";
import type { Tournament } from "@/types/competition";

const TOURNAMENT_IDS = [1, 2, 3, 4, 5, 6, 7, 8] as Tournament["id"][];

export default function StatisticsPage() {
  const [states, setStates] = useState<CompetitionState[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStates(loadCompetitionStates(TOURNAMENT_IDS));
    setHydrated(true);
  }, []);

  const statistics = useMemo(() => calculateCompetitionStatistics(states), [states]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-amber-400">
          Competition data
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
          Statistics
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-zinc-400">
          Tournament-wide totals calculated from all completed matches in the current season.
        </p>
      </header>

      {!hydrated ? (
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-400">Loading competition statistics…</div>
      ) : (
        <>
          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatisticCard label="Tournaments completed" value={`${statistics.tournamentsCompleted}/8`} />
            <StatisticCard label="Matches completed" value={statistics.matchesCompleted} />
            <StatisticCard label="Rounds played" value={statistics.roundsPlayed} />
            <StatisticCard label="Average match length" value={statistics.averageRoundsPerMatch.toFixed(1)} />
          </section>

          <section className="mt-6 grid gap-4 lg:grid-cols-2">
            <BreakdownCard
              title="Match breakdown"
              rows={[
                ["Group matches", statistics.groupMatchesCompleted],
                ["Knockout matches", statistics.knockoutMatchesCompleted],
                ["Sweeps", statistics.sweeps],
                ["One-round margins", statistics.decidingMatches],
              ]}
            />
            <BreakdownCard
              title="Season leaders"
              rows={[
                ["Highest win rate", statistics.highestWinRatePlayer ?? "—"],
                ["Most rounds won", statistics.mostRoundsWonPlayer ?? "—"],
                ["Tournaments started", statistics.tournamentsStarted],
                ["Tournaments remaining", Math.max(0, 8 - statistics.tournamentsCompleted)],
              ]}
            />
          </section>
        </>
      )}
    </main>
  );
}

function StatisticCard({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</p>
      <p className="mt-3 text-3xl font-black">{value}</p>
    </article>
  );
}

function BreakdownCard({
  title,
  rows,
}: {
  title: string;
  rows: Array<[string, string | number]>;
}) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <h2 className="text-xl font-black">{title}</h2>
      <dl className="mt-5 divide-y divide-zinc-800">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <dt className="text-sm text-zinc-500">{label}</dt>
            <dd className="font-black text-zinc-200">{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
