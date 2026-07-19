"use client";

import Link from "next/link";
import { useMemo } from "react";
import SeasonStandingsTable from "@/components/season/SeasonStandingsTable";
import type { CompetitionState } from "@/lib/competition/engine";
import {
  calculateSeasonStandings,
  getCompletedTournamentCount,
} from "@/lib/competition/season";
import { loadCompetitionStates } from "@/lib/competition/storage";
import type { Tournament } from "@/types/competition";

type SeasonStandingsPreviewProps = {
  currentState: CompetitionState;
};

const TOURNAMENT_IDS = [1, 2, 3, 4, 5, 6, 7, 8] as Tournament["id"][];

export default function SeasonStandingsPreview({
  currentState,
}: SeasonStandingsPreviewProps) {
  const states = useMemo(() => {
    const storedStates = loadCompetitionStates(TOURNAMENT_IDS).filter(
      (state) => state.tournamentId !== currentState.tournamentId,
    );

    return [...storedStates, currentState];
  }, [currentState]);

  const standings = useMemo(() => calculateSeasonStandings(states), [states]);
  const completedTournaments = getCompletedTournamentCount(states);

  return (
    <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-400">
            Season standings
          </p>
          <h2 className="mt-2 text-2xl font-black">Championship race</h2>
          <p className="mt-2 text-sm text-zinc-400">
            {completedTournaments} of 8 tournaments completed
          </p>
        </div>

        <Link
          href="/standings"
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:border-amber-400 hover:text-white"
        >
          Full standings
        </Link>
      </div>

      <SeasonStandingsTable standings={standings} compact />
    </section>
  );
}
