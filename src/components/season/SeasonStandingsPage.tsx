"use client";

import { useEffect, useMemo, useState } from "react";
import SeasonStandingsTable from "@/components/season/SeasonStandingsTable";
import type { CompetitionState } from "@/lib/competition/engine";
import {
  calculateSeasonStandings,
  getCompletedTournamentCount,
} from "@/lib/competition/season";
import { loadCompetitionStates } from "@/lib/competition/storage";
import type { Tournament } from "@/types/competition";

const TOURNAMENT_IDS = [1, 2, 3, 4, 5, 6, 7, 8] as Tournament["id"][];

export default function SeasonStandingsPage() {
  const [states, setStates] = useState<CompetitionState[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStates(loadCompetitionStates(TOURNAMENT_IDS));
    setHydrated(true);
  }, []);

  const standings = useMemo(() => calculateSeasonStandings(states), [states]);
  const completedTournaments = getCompletedTournamentCount(states);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-amber-400">
          Tits &amp; Ass
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
          Season standings
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-zinc-400">
          Tournament points decide the championship race. Ties are separated by
          titles, match wins, round difference, and rounds won.
        </p>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Completed" value={`${completedTournaments}/8`} />
        <SummaryCard label="Leader" value={standings[0]?.player.name ?? "—"} />
        <SummaryCard
          label="Leading points"
          value={standings[0]?.tournamentPoints ?? 0}
        />
      </div>

      {!hydrated ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-400">
          Loading saved season results…
        </div>
      ) : (
        <SeasonStandingsTable standings={standings} />
      )}

      <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-sm text-zinc-400">
        <p className="font-bold text-zinc-200">Tournament points</p>
        <p className="mt-2">
          Winner 6 · Runner-up 3 · Losing semifinalists 1 each
        </p>
      </section>
    </main>
  );
}

type SummaryCardProps = {
  label: string;
  value: string | number;
};

function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}
