import Link from "next/link";
import PlayerLink from "@/components/players/PlayerLink";
import type { SeasonStandingRow } from "@/lib/competition/season";

type StandingsPreviewProps = {
  standings: SeasonStandingRow[];
};

export default function StandingsPreview({ standings }: StandingsPreviewProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Season one</p>
          <h2 className="mt-1 text-2xl font-bold">Current standings</h2>
        </div>
        <Link href="/championship" className="text-sm font-semibold text-amber-400 hover:text-amber-300">
          Full table
        </Link>
      </div>
      <div>
        {standings.slice(0, 5).map((standing) => (
          <div key={standing.player.id} className="grid grid-cols-[2rem_1fr_auto] items-center gap-4 border-b border-zinc-800 px-6 py-4 last:border-b-0">
            <span className="text-center font-bold text-zinc-500">{standing.position}</span>
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: standing.player.colour }} />
              <PlayerLink player={standing.player} className="font-semibold hover:text-amber-300 hover:underline">{standing.player.shortName}</PlayerLink>
            </div>
            <span className="text-lg font-black">
              {standing.tournamentPoints}<span className="ml-1 text-xs font-semibold text-zinc-500">pts</span>
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}
