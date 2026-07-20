"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  COMPETITION_PROGRESS_EVENT,
  getEffectiveTournamentStatuses,
} from "@/lib/competition/progression";
import type { Tournament, TournamentStatus } from "@/types/competition";

type TournamentNavigationProps = {
  currentTournamentId: Tournament["id"];
  tournaments: Tournament[];
};

export default function TournamentNavigation({
  currentTournamentId,
  tournaments,
}: TournamentNavigationProps) {
  const [statuses, setStatuses] = useState<Map<number, TournamentStatus>>(
    () =>
      new Map(
        tournaments.map((tournament) => [tournament.id, tournament.status]),
      ),
  );

  useEffect(() => {
    const refresh = (): void => {
      setStatuses(getEffectiveTournamentStatuses(tournaments));
    };

    refresh();

    window.addEventListener("storage", refresh);

    window.addEventListener(COMPETITION_PROGRESS_EVENT, refresh);

    return () => {
      window.removeEventListener("storage", refresh);

      window.removeEventListener(COMPETITION_PROGRESS_EVENT, refresh);
    };
  }, [tournaments]);

  return (
    <nav
      aria-label="Season tournaments"
      className="mb-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 px-5 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
            Season navigation
          </p>

          <h2 className="mt-1 text-lg font-black">Tournaments</h2>
        </div>

        <p className="text-sm text-zinc-500">
          {tournaments.length} tournaments
        </p>
      </div>

      <div className="overflow-x-auto p-2">
        <div className="grid min-w-[720px] grid-cols-8 gap-2">
          {tournaments.map((tournament) => (
            <TournamentNavigationButton
              key={tournament.id}
              tournament={{
                ...tournament,
                status: statuses.get(tournament.id) ?? tournament.status,
              }}
              active={tournament.id === currentTournamentId}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

type TournamentNavigationButtonProps = {
  tournament: Tournament;
  active: boolean;
};

function TournamentNavigationButton({
  tournament,
  active,
}: TournamentNavigationButtonProps) {
  const locked = tournament.status === "LOCKED";

  const content = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-black">T{tournament.id}</span>

        <StatusIndicator status={tournament.status} />
      </div>

      <p
        className={`mt-2 text-left text-[11px] font-bold uppercase tracking-wider ${
          active ? "text-zinc-800" : getStatusTextClass(tournament.status)
        }`}
      >
        {getStatusLabel(tournament.status)}
      </p>
    </>
  );

  const className = `block rounded-xl border px-3 py-3 transition ${
    active
      ? "border-amber-400 bg-amber-400 text-zinc-950 shadow-lg shadow-amber-400/10"
      : locked
        ? "cursor-not-allowed border-zinc-800 bg-zinc-950 text-zinc-700"
        : "border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
  }`;

  if (locked) {
    return (
      <div aria-disabled="true" className={className}>
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/tournaments/${tournament.id}`}
      aria-current={active ? "page" : undefined}
      className={className}
    >
      {content}
    </Link>
  );
}

function StatusIndicator({ status }: { status: TournamentStatus }) {
  return (
    <span
      aria-hidden="true"
      className={`h-2.5 w-2.5 rounded-full ${
        status === "COMPLETED"
          ? "bg-emerald-400"
          : status === "READY"
            ? "bg-amber-400"
            : status === "IN_PROGRESS"
              ? "bg-blue-400"
              : "bg-zinc-700"
      }`}
    />
  );
}

function getStatusLabel(status: TournamentStatus): string {
  return {
    LOCKED: "Locked",
    READY: "Ready",
    IN_PROGRESS: "Live",
    COMPLETED: "Complete",
  }[status];
}

function getStatusTextClass(status: TournamentStatus): string {
  return {
    LOCKED: "text-zinc-700",
    READY: "text-amber-400",
    IN_PROGRESS: "text-blue-400",
    COMPLETED: "text-emerald-400",
  }[status];
}
