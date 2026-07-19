"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SeasonStandingsTable from "@/components/season/SeasonStandingsTable";
import { calculateMentorStandings } from "@/lib/competition/mentors";
import { COMPETITION_PROGRESS_EVENT } from "@/lib/competition/progression";
import type { CompetitionState } from "@/lib/competition/engine";
import {
  calculateSeasonStandings,
  getCompletedTournamentCount,
  getTournamentSummaries,
} from "@/lib/competition/season";
import { loadCompetitionStates } from "@/lib/competition/storage";
import type { Tournament } from "@/types/competition";

const TOURNAMENT_IDS = [1, 2, 3, 4, 5, 6, 7, 8] as Tournament["id"][];

export default function ChampionshipPage() {
  const [states, setStates] = useState<CompetitionState[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setStates(loadCompetitionStates(TOURNAMENT_IDS));
      setHydrated(true);
    };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(COMPETITION_PROGRESS_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(COMPETITION_PROGRESS_EVENT, refresh);
    };
  }, []);

  const standings = useMemo(() => calculateSeasonStandings(states), [states]);
  const tournamentSummaries = useMemo(
    () => getTournamentSummaries(states, TOURNAMENT_IDS),
    [states],
  );
  const completedTournaments = getCompletedTournamentCount(states);
  const leader = standings[0];
  const mentorStandings = useMemo(() => calculateMentorStandings(states), [states]);
  const remainingTournaments = TOURNAMENT_IDS.length - completedTournaments;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-amber-400">
            Tits &amp; Ass
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Championship
          </h1>
          <p className="mt-3 max-w-3xl leading-7 text-zinc-400">
            Eight tournaments decide the season champion. Tournament points lead
            the table, followed by titles, match wins, round difference, and
            rounds won.
          </p>
        </div>

        <Link
          href="/tournaments/4"
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-bold text-zinc-300 transition hover:border-amber-400 hover:text-white"
        >
          Current tournament
        </Link>
      </header>

      {!hydrated ? (
        <ChampionshipLoadingState />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Season progress"
              value={`${completedTournaments}/8`}
              detail={`${remainingTournaments} tournaments remaining`}
            />
            <SummaryCard
              label="Championship leader"
              value={leader?.player.name ?? "—"}
              detail={leader ? `${leader.tournamentPoints} points` : "No results yet"}
            />
            <SummaryCard
              label="Most titles"
              value={getMostTitlesLabel(standings)}
              detail={getMostTitlesDetail(standings)}
            />
            <SummaryCard
              label="Matches recorded"
              value={standings.reduce((total, row) => total + row.matchWins, 0)}
              detail="Completed matches across the season"
            />
          </section>

          <section className="mt-8">
            <SectionHeading
              eyebrow="Championship table"
              title="Season standings"
              description="Tournament points determine the champion. The remaining columns provide the ordered tiebreaks and season record."
            />
            <div className="mt-5">
              <SeasonStandingsTable standings={standings} />
            </div>
          </section>

          <section className="mt-8">
            <SectionHeading
              eyebrow="Mentor championship"
              title="Mentor standings"
              description="Mentors score the same 6 / 3 / 1 points earned by the players they drafted at each tournament."
            />
            <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
              {mentorStandings.map((row, index) => (
                <div key={row.mentor.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-zinc-800 px-5 py-4 last:border-b-0">
                  <span className="text-lg font-black text-zinc-500">{index + 1}</span>
                  <div><p className="font-black">{row.mentor.name}</p><p className="mt-1 text-xs text-zinc-500">{row.tournamentWins} draft wins · best {row.bestDraft} pts</p></div>
                  <span className="text-2xl font-black text-amber-400">{row.points}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <SectionHeading
              eyebrow="Tournament history"
              title="Season results"
              description="Completed tournaments show their podium. Generated tournaments remain available from the tournament navigation."
            />

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {tournamentSummaries.map((summary) => (
                <TournamentSummaryCard key={summary.tournamentId} summary={summary} />
              ))}
            </div>
          </section>

          <section className="mt-8 grid gap-4 lg:grid-cols-2">
            <InfoCard title="Tournament points">
              Winner <strong className="text-white">6</strong> · Runner-up{" "}
              <strong className="text-white">3</strong> · Losing semifinalists{" "}
              <strong className="text-white">1 each</strong>
            </InfoCard>
            <InfoCard title="Standings order">
              Points · Titles · Match wins · Round difference · Rounds won ·
              Player name
            </InfoCard>
          </section>
        </>
      )}
    </main>
  );
}

function ChampionshipLoadingState() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-amber-400">
        Restoring championship
      </p>
      <p className="mt-3 text-zinc-400">Loading saved tournament results…</p>
    </div>
  );
}

type SummaryCardProps = {
  label: string;
  value: string | number;
  detail: string;
};

function SummaryCard({ label, value, detail }: SummaryCardProps) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
        {label}
      </p>
      <p className="mt-3 truncate text-2xl font-black">{value}</p>
      <p className="mt-2 text-sm text-zinc-500">{detail}</p>
    </article>
  );
}

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-400">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-black sm:text-3xl">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
        {description}
      </p>
    </div>
  );
}

type TournamentSummary = ReturnType<typeof getTournamentSummaries>[number];

type TournamentSummaryCardProps = {
  summary: TournamentSummary;
};

function TournamentSummaryCard({ summary }: TournamentSummaryCardProps) {
  return (
    <Link
      href={`/tournaments/${summary.tournamentId}`}
      className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-amber-400/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-amber-400">
            Tournament {summary.tournamentId}
          </p>
          <h3 className="mt-2 text-xl font-black">
            {summary.status === "COMPLETED"
              ? summary.champion?.name
              : summary.status === "IN_PROGRESS"
                ? "In progress"
                : "Not started"}
          </h3>
        </div>
        <span className={getTournamentStatusClasses(summary.status)}>
          {summary.status.replaceAll("_", " ")}
        </span>
      </div>

      {summary.status === "COMPLETED" ? (
        <div className="mt-5 space-y-2 text-sm">
          <PlacementLine label="Champion" value={summary.champion?.name ?? "—"} />
          <PlacementLine label="Runner-up" value={summary.runnerUp?.name ?? "—"} />
        </div>
      ) : (
        <p className="mt-5 text-sm leading-6 text-zinc-500">
          {summary.status === "IN_PROGRESS"
            ? "Open the tournament to continue entering results."
            : "The tournament has not generated a draw on this browser yet."}
        </p>
      )}

      <p className="mt-5 text-sm font-bold text-zinc-500 transition group-hover:text-amber-400">
        View tournament →
      </p>
    </Link>
  );
}

function PlacementLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-zinc-500">{label}</span>
      <span className="truncate font-bold text-zinc-200">{value}</span>
    </div>
  );
}

function getTournamentStatusClasses(status: Tournament["status"]) {
  const base =
    "rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest";

  if (status === "COMPLETED") {
    return `${base} border-emerald-400/30 bg-emerald-400/10 text-emerald-400`;
  }

  if (status === "IN_PROGRESS") {
    return `${base} border-blue-400/30 bg-blue-400/10 text-blue-400`;
  }

  return `${base} border-zinc-700 bg-zinc-950 text-zinc-500`;
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-sm leading-7 text-zinc-400">
      <p className="font-black text-zinc-200">{title}</p>
      <p className="mt-2">{children}</p>
    </section>
  );
}

function getMostTitlesLabel(
  standings: ReturnType<typeof calculateSeasonStandings>,
): string {
  const mostTitles = Math.max(0, ...standings.map((row) => row.tournamentWins));

  if (mostTitles === 0) {
    return "—";
  }

  return standings
    .filter((row) => row.tournamentWins === mostTitles)
    .map((row) => row.player.shortName || row.player.name)
    .join(", ");
}

function getMostTitlesDetail(
  standings: ReturnType<typeof calculateSeasonStandings>,
): string {
  const mostTitles = Math.max(0, ...standings.map((row) => row.tournamentWins));
  return mostTitles === 0
    ? "No completed tournaments"
    : `${mostTitles} ${mostTitles === 1 ? "title" : "titles"}`;
}
