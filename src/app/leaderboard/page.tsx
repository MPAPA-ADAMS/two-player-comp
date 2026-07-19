import { seasonStandings } from "@/lib/mockData";

function getTotal(points: number[]) {
  return points.reduce((total, pointsValue) => total + pointsValue, 0);
}

export default function LeaderboardPage() {
  const sortedStandings = [...seasonStandings].sort((a, b) => {
    const totalDifference =
      getTotal(b.tournamentPoints) - getTotal(a.tournamentPoints);

    if (totalDifference !== 0) {
      return totalDifference;
    }

    if (b.tournamentWins !== a.tournamentWins) {
      return b.tournamentWins - a.tournamentWins;
    }

    if (b.runnerUpFinishes !== a.runnerUpFinishes) {
      return b.runnerUpFinishes - a.runnerUpFinishes;
    }

    return b.semifinalFinishes - a.semifinalFinishes;
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">
          Season 1
        </p>

        <h1 className="mt-2 text-4xl font-bold">Leaderboard</h1>

        <p className="mt-3 text-zinc-400">
          Six points for a tournament win, three for second place, and one for
          each losing semifinalist.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-zinc-900 text-left text-zinc-400">
            <tr>
              <th className="px-4 py-3">Pos</th>
              <th className="px-4 py-3">Player</th>

              {Array.from({ length: 8 }, (_, index) => (
                <th key={index} className="px-4 py-3 text-center">
                  T{index + 1}
                </th>
              ))}

              <th className="px-4 py-3 text-center">Wins</th>
              <th className="px-4 py-3 text-center">Total</th>
            </tr>
          </thead>

          <tbody>
            {sortedStandings.map((standing, index) => (
              <tr
                key={standing.player.id}
                className="border-t border-zinc-800 bg-zinc-950"
              >
                <td className="px-4 py-4 font-semibold">{index + 1}</td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: standing.player.colour }}
                    />

                    <span className="font-medium">
                      {standing.player.shortName}
                    </span>
                  </div>
                </td>

                {standing.tournamentPoints.map((points, tournamentIndex) => (
                  <td
                    key={tournamentIndex}
                    className="px-4 py-4 text-center text-zinc-300"
                  >
                    {points}
                  </td>
                ))}

                <td className="px-4 py-4 text-center">
                  {standing.tournamentWins}
                </td>

                <td className="px-4 py-4 text-center text-lg font-bold">
                  {getTotal(standing.tournamentPoints)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
