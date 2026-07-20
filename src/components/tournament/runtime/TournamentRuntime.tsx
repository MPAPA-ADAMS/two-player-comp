"use client";

import { useEffect, useMemo, useState } from "react";

import CompletedTournament from "@/components/tournament/CompletedTournament";
import ReadyTournament from "@/components/tournament/ReadyTournament";
import TournamentNavigation from "@/components/tournament/TournamentNavigation";
import { createTournamentHistoryFromState } from "@/lib/competition/history";
import {
  COMPETITION_PROGRESS_EVENT,
  getEffectiveTournamentStatuses,
} from "@/lib/competition/progression";
import { loadCompetitionState } from "@/lib/competition/storage";
import type { Player, Tournament, TournamentStatus } from "@/types/competition";

type TournamentRuntimeProps = {
  tournament: Tournament;
  tournaments: Tournament[];
  players: Player[];
  editable: boolean;
};

export default function TournamentRuntime({
  tournament,
  tournaments,
  players,
  editable,
}: TournamentRuntimeProps) {
  const [hydrated, setHydrated] = useState(false);
  const [statuses, setStatuses] = useState<Map<number, TournamentStatus>>(
    new Map(),
  );

  useEffect(() => {
    const refresh = () => {
      setStatuses(getEffectiveTournamentStatuses(tournaments));
      setHydrated(true);
    };

    refresh();

    window.addEventListener("storage", refresh);
    window.addEventListener(COMPETITION_PROGRESS_EVENT, refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(COMPETITION_PROGRESS_EVENT, refresh);
    };
  }, [tournaments]);

  const status = statuses.get(tournament.id) ?? tournament.status;

  const nextTournamentGenerated = useMemo(() => {
    const nextTournament = tournaments.find(
      (item) => item.id === tournament.id + 1,
    );

    return nextTournament
      ? statuses.get(nextTournament.id) !== "LOCKED"
      : false;
  }, [statuses, tournament.id, tournaments]);

  const historicalView = useMemo(() => {
    if (status !== "COMPLETED") {
      return null;
    }

    const nextTournament = tournaments.find(
      (item) => item.id === tournament.id + 1,
    );

    if (!nextTournament) {
      return null;
    }

    const nextState = loadCompetitionState(nextTournament.id);

    const nextTournamentStarted =
      nextState?.groupAPlayers.length === 4 &&
      nextState.groupBPlayers.length === 4;

    if (!nextTournamentStarted) {
      return null;
    }

    const completedState = loadCompetitionState(tournament.id);

    return completedState
      ? createTournamentHistoryFromState(tournament, completedState)
      : null;
  }, [status, tournament, tournaments]);

  if (!hydrated) {
    return (
      <section>
        <TournamentNavigation
          currentTournamentId={tournament.id}
          tournaments={tournaments}
        />

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-amber-400">
            Loading tournament
          </p>

          <p className="mt-3 text-zinc-400">Checking season progress…</p>
        </div>
      </section>
    );
  }

  if (historicalView) {
    return (
      <CompletedTournament history={historicalView} tournaments={tournaments} />
    );
  }

  if (status === "LOCKED") {
    return (
      <section>
        <TournamentNavigation
          currentTournamentId={tournament.id}
          tournaments={tournaments}
        />

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
            Tournament {tournament.id}
          </p>

          <h1 className="mt-3 text-4xl font-black">{tournament.game}</h1>

          <span className="mt-5 inline-flex rounded-full border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
            Locked
          </span>

          <p className="mt-6 max-w-2xl leading-7 text-zinc-400">
            Complete Tournament {tournament.id - 1} to unlock this event.
          </p>
        </div>
      </section>
    );
  }

  return (
    <ReadyTournament
      tournament={tournament}
      tournaments={tournaments}
      players={players}
      nextTournamentGenerated={nextTournamentGenerated}
      editable={editable}
    />
  );
}
