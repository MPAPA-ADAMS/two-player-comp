import Link from "next/link";
import type { SeasonStanding, Tournament } from "@/types/competition";

type SummaryCardsProps = {
  leader: SeasonStanding;
  leaderPoints: number;
  currentTournament: Tournament;
  completedTournaments: number;
  totalTournaments: number;
};

export default function SummaryCards({
  leader,
  leaderPoints,
  currentTournament,
  completedTournaments,
  totalTournaments,
}: SummaryCardsProps) {
  const progressPercentage = (completedTournaments / totalTournaments) * 100;

  return (
    <section className="grid gap-5 md:grid-cols-3">
      <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
          Current leader
        </p>

        <div className="mt-6 flex items-center gap-4">
          <span
            className="h-12 w-2 rounded-full"
            style={{ backgroundColor: leader.player.colour }}
          />

          <div>
            <h2 className="text-3xl font-bold">{leader.player.shortName}</h2>

            <p className="mt-1 text-zinc-400">
              {leader.tournamentWins} tournament wins
            </p>
          </div>
        </div>

        <p className="mt-8 text-5xl font-black text-amber-400">
          {leaderPoints}
          <span className="ml-2 text-lg font-semibold text-zinc-500">pts</span>
        </p>
      </article>

      <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
          Current tournament
        </p>

        <p className="mt-6 text-sm font-semibold text-amber-400">
          Tournament {currentTournament.id}
        </p>

        <h2 className="mt-2 text-3xl font-bold">{currentTournament.game}</h2>

        <p className="mt-3 text-zinc-400">Best of {currentTournament.bestOf}</p>

        <Link
          href="/tournaments"
          className="mt-8 inline-block font-semibold text-white transition hover:text-amber-400"
        >
          View tournament →
        </Link>
      </article>

      <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
          Season progress
        </p>

        <p className="mt-6 text-4xl font-black">
          {completedTournaments}
          <span className="text-xl text-zinc-500"> / {totalTournaments}</span>
        </p>

        <p className="mt-2 text-zinc-400">Tournaments completed</p>

        <div className="mt-8 h-3 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-amber-400"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </article>
    </section>
  );
}
