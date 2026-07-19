import PlayerLink from "@/components/players/PlayerLink";
import type { SeasonStandingRow } from "@/lib/competition/season";

type SeasonStandingsTableProps = {
  standings: SeasonStandingRow[];
  compact?: boolean;
};

export default function SeasonStandingsTable({
  standings,
  compact = false,
}: SeasonStandingsTableProps) {
  if (standings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 p-8 text-center">
        <p className="font-black text-zinc-300">No season results yet</p>
        <p className="mt-2 text-sm text-zinc-500">
          Generate a tournament draw and save results to populate the table.
        </p>
      </div>
    );
  }

  const displayedStandings = compact ? standings.slice(0, 4) : standings;

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="bg-zinc-900 text-xs uppercase tracking-wider text-zinc-500">
          <tr>
            <th className="px-4 py-3 text-left">Pos</th>
            <th className="px-4 py-3 text-left">Player</th>
            <th className="px-3 py-3 text-center">Pts</th>
            <th className="px-3 py-3 text-center">Titles</th>
            <th className="px-3 py-3 text-center">MW</th>
            <th className="px-3 py-3 text-center">ML</th>
            <th className="px-3 py-3 text-center">RW</th>
            <th className="px-3 py-3 text-center">RD</th>
          </tr>
        </thead>

        <tbody>
          {displayedStandings.map((standing) => (
            <tr
              key={standing.player.id}
              className="border-t border-zinc-800 first:border-t-0"
            >
              <td className="px-4 py-4">
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full font-black ${
                    standing.position === 1
                      ? "bg-amber-400 text-zinc-950"
                      : "bg-zinc-900 text-zinc-400"
                  }`}
                >
                  {standing.position}
                </span>
              </td>

              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: standing.player.colour }}
                  />
                  <div>
                    <p className="font-bold"><PlayerLink player={standing.player}>{standing.player.name}</PlayerLink></p>
                    <p className="text-xs text-zinc-500">
                      {standing.tournamentsPlayed} tournaments
                    </p>
                  </div>
                </div>
              </td>

              <SeasonCell value={standing.tournamentPoints} emphasized />
              <SeasonCell value={standing.tournamentWins} />
              <SeasonCell value={standing.matchWins} />
              <SeasonCell value={standing.matchLosses} />
              <SeasonCell value={standing.roundsWon} />
              <SeasonCell
                value={
                  standing.roundDifference > 0
                    ? `+${standing.roundDifference}`
                    : standing.roundDifference
                }
              />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type SeasonCellProps = {
  value: string | number;
  emphasized?: boolean;
};

function SeasonCell({ value, emphasized = false }: SeasonCellProps) {
  return (
    <td
      className={`px-3 py-4 text-center ${
        emphasized ? "text-lg font-black text-amber-400" : "font-bold"
      }`}
    >
      {value}
    </td>
  );
}
