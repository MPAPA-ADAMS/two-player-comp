"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import PlayerLink from "@/components/players/PlayerLink";
import type { CompetitionState } from "@/lib/competition/engine";
import { buildPlayerProfileStats } from "@/lib/competition/playerStats";
import { COMPETITION_PROGRESS_EVENT } from "@/lib/competition/progression";
import { loadCompetitionStates } from "@/lib/competition/storage";
import type { MatchStage, Player, Tournament } from "@/types/competition";

type PlayerProfilePageProps = {
  player: Player;
  tournaments: Tournament[];
};

export default function PlayerProfilePage({
  player,
  tournaments,
}: PlayerProfilePageProps) {
  const [states, setStates] = useState<CompetitionState[]>([]);

  const [hydrated, setHydrated] = useState(false);

  const tournamentIds = useMemo(
    () => tournaments.map((tournament) => tournament.id),
    [tournaments],
  );

  useEffect(() => {
    const load = (): void => {
      setStates(loadCompetitionStates(tournamentIds));

      setHydrated(true);
    };

    load();

    window.addEventListener(COMPETITION_PROGRESS_EVENT, load);

    window.addEventListener("storage", load);

    return () => {
      window.removeEventListener(COMPETITION_PROGRESS_EVENT, load);

      window.removeEventListener("storage", load);
    };
  }, [tournamentIds]);

  const stats = useMemo(
    () => buildPlayerProfileStats(player, states, tournaments),
    [player, states, tournaments],
  );

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 text-zinc-400">
        Loading player profile…
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/players"
        className="text-sm font-bold text-zinc-400 transition hover:text-amber-300"
      >
        ← All players
      </Link>

      <header className="mt-5 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
        <div className="h-2" style={{ backgroundColor: player.colour }} />
        <div className="grid gap-8 p-6 lg:grid-cols-[1fr_auto] lg:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-400">
              Player profile
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
              {player.name}
            </h1>
            <p className="mt-3 max-w-2xl text-zinc-400">
              Complete championship record, tournament finishes, opponent
              history, and every recorded fixture.
            </p>
          </div>
          <div className="flex items-center gap-4 lg:text-right">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                Championship points
              </p>
              <p className="mt-1 text-5xl font-black text-amber-400">
                {stats.tournamentPoints}
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <Stat label="Titles" value={stats.titles} />
        <Stat label="Finals" value={stats.titles + stats.runnerUps} />
        <Stat label="Tournaments" value={stats.tournamentsPlayed} />
        <Stat
          label="Match record"
          value={`${stats.matchWins}-${stats.matchLosses}`}
        />
        <Stat label="Win rate" value={`${stats.winRate}%`} />
        <Stat label="Rounds" value={`${stats.roundsWon}-${stats.roundsLost}`} />
        <Stat label="Round diff" value={signed(stats.roundDifference)} />
        <Stat label="Best streak" value={stats.longestWinStreak} />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <Panel title="Tournament history" subtitle="Performance in every event">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="pb-3">Tournament</th>
                  <th className="pb-3">Finish</th>
                  <th className="pb-3">Points</th>
                  <th className="pb-3">Record</th>
                  <th className="pb-3">Rounds</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {stats.tournaments.map((row) => (
                  <tr key={row.tournament.id}>
                    <td className="py-3">
                      <Link
                        className="font-bold hover:text-amber-300"
                        href={`/tournaments/${row.tournament.id}`}
                      >
                        T{row.tournament.id} · {row.tournament.game}
                      </Link>
                    </td>
                    <td className="py-3">
                      <FinishBadge finish={row.finish} />
                    </td>
                    <td className="py-3 font-black">{row.points}</td>
                    <td className="py-3">
                      {row.wins}-{row.losses}
                    </td>
                    <td className="py-3">
                      {row.roundsFor}-{row.roundsAgainst}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Detailed report" subtitle="Stage and opponent splits">
          <div className="grid gap-4 sm:grid-cols-2">
            <Insight
              label="Current streak"
              value={`${stats.currentWinStreak} wins`}
            />
            <Insight
              label="Best matchup"
              value={
                stats.bestOpponent
                  ? `${stats.bestOpponent.opponent.shortName} (${stats.bestOpponent.wins}-${stats.bestOpponent.losses})`
                  : "—"
              }
            />
            <Insight
              label="Toughest matchup"
              value={
                stats.toughestOpponent
                  ? `${stats.toughestOpponent.opponent.shortName} (${stats.toughestOpponent.wins}-${stats.toughestOpponent.losses})`
                  : "—"
              }
            />
            <Insight
              label="Knockout record"
              value={knockoutRecord(stats.stageRecords)}
            />
          </div>
          <div className="mt-5 space-y-3">
            {stats.stageRecords.map((row) => (
              <div
                key={row.stage}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4"
              >
                <div>
                  <p className="font-black">{stageLabel(row.stage)}</p>
                  <p className="text-xs text-zinc-500">
                    Rounds {row.roundsFor}-{row.roundsAgainst}
                  </p>
                </div>
                <span className="text-sm text-zinc-400">
                  {row.played} played
                </span>
                <span className="font-black">
                  {row.wins}-{row.losses}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Panel
          title="Fixture history"
          subtitle={`${stats.fixtures.length} completed matches`}
        >
          {stats.fixtures.length === 0 ? (
            <p className="text-zinc-500">No completed fixtures yet.</p>
          ) : (
            <div className="space-y-2">
              {[...stats.fixtures].reverse().map((fixture) => (
                <div
                  key={`${fixture.tournamentId}-${fixture.match.id}`}
                  className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:grid-cols-[90px_1fr_auto_auto] sm:items-center"
                >
                  <Link
                    href={`/tournaments/${fixture.tournamentId}`}
                    className="text-xs font-black uppercase tracking-wider text-zinc-500 hover:text-amber-300"
                  >
                    T{fixture.tournamentId} · {stageLabel(fixture.match.stage)}
                  </Link>
                  <div>
                    <span className="text-zinc-500">vs </span>
                    <PlayerLink
                      player={fixture.opponent}
                      className="font-bold hover:text-amber-300 hover:underline"
                    />
                  </div>
                  <span
                    className={`w-fit rounded-full px-2.5 py-1 text-xs font-black ${fixture.won ? "bg-emerald-400/15 text-emerald-300" : "bg-red-400/15 text-red-300"}`}
                  >
                    {fixture.won ? "WIN" : "LOSS"}
                  </span>
                  <span className="text-xl font-black">
                    {fixture.roundsFor}-{fixture.roundsAgainst}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Head-to-head" subtitle="Record against every opponent">
          <div className="space-y-2">
            {stats.opponentRecords.map((row) => (
              <div
                key={row.opponent.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4"
              >
                <div>
                  <PlayerLink
                    player={row.opponent}
                    className="font-black hover:text-amber-300 hover:underline"
                  />
                  <p className="text-xs text-zinc-500">
                    Rounds {row.roundsFor}-{row.roundsAgainst}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black">
                    {row.wins}-{row.losses}
                  </p>
                  <p className="text-xs text-zinc-500">{row.played} matches</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </main>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}
function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
}
function Insight({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        {label}
      </p>
      <p className="mt-2 font-black">{value}</p>
    </div>
  );
}
function FinishBadge({ finish }: { finish: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-bold ${finish === "Winner" ? "bg-amber-400 text-zinc-950" : finish === "Runner-up" || finish === "Semifinal" ? "bg-zinc-700 text-zinc-100" : "bg-zinc-800 text-zinc-400"}`}
    >
      {finish}
    </span>
  );
}
function signed(value: number) {
  return value > 0 ? `+${value}` : String(value);
}
function stageLabel(stage: MatchStage) {
  return stage === "GROUP"
    ? "Group"
    : stage === "SEMIFINAL"
      ? "Semifinal"
      : stage === "FINAL"
        ? "Final"
        : "Tiebreak";
}
function knockoutRecord(
  rows: Array<{ stage: MatchStage; wins: number; losses: number }>,
) {
  const knockout = rows.filter(
    (row) => row.stage === "SEMIFINAL" || row.stage === "FINAL",
  );
  return `${knockout.reduce((sum, row) => sum + row.wins, 0)}-${knockout.reduce((sum, row) => sum + row.losses, 0)}`;
}
