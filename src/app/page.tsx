import Link from "next/link";
import {
  groupAPlayers,
  groupBPlayers,
  seasonStandings,
  tournaments,
} from "@/lib/mockData";

function getTotal(points: number[]) {
  return points.reduce((total, value) => total + value, 0);
}

export default function HomePage() {
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

  const leader = sortedStandings[0];
  const currentTournament = tournaments[3];
  const completedTournaments = 3;
  const progressPercentage = (completedTournaments / tournaments.length) * 100;

  const latestResults = [
    {
      id: "result-1",
      playerOne: "Mike",
      playerOneScore: 3,
      playerTwo: "Alex",
      playerTwoScore: 2,
    },
    {
      id: "result-2",
      playerOne: "Jack",
      playerOneScore: 3,
      playerTwo: "Harry",
      playerTwoScore: 1,
    },
    {
      id: "result-3",
      playerOne: "Tom",
      playerOneScore: 2,
      playerTwo: "Ben",
      playerTwoScore: 0,
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="border-b border-zinc-800">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-amber-400">
              Season One
            </p>

            <h1 className="mt-5 text-6xl font-black tracking-tight sm:text-7xl lg:text-8xl">
              Tits <span className="text-amber-400">&amp;</span> Ass
            </h1>

            <p className="mt-6 max-w-2xl text-xl leading-8 text-zinc-300">
              Prepare For The Ass Wiping Of Your Life. Bitch.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/leaderboard"
                className="rounded-lg bg-amber-400 px-6 py-3 font-bold text-zinc-950 transition hover:bg-amber-300"
              >
                View leaderboard
              </Link>

              <Link
                href="/tournaments"
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-6 py-3 font-bold text-white transition hover:border-zinc-500 hover:bg-zinc-800"
              >
                Current tournament
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-10">
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
                <h2 className="text-3xl font-bold">
                  {leader.player.shortName}
                </h2>

                <p className="mt-1 text-zinc-400">
                  {leader.tournamentWins} tournament wins
                </p>
              </div>
            </div>

            <p className="mt-8 text-5xl font-black text-amber-400">
              {getTotal(leader.tournamentPoints)}
              <span className="ml-2 text-lg font-semibold text-zinc-500">
                pts
              </span>
            </p>
          </article>

          <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
              Current tournament
            </p>

            <p className="mt-6 text-sm font-semibold text-amber-400">
              Tournament {currentTournament.id}
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {currentTournament.game}
            </h2>

            <p className="mt-3 text-zinc-400">
              Best of {currentTournament.bestOf}
            </p>

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
              <span className="text-xl text-zinc-500">
                {" "}
                / {tournaments.length}
              </span>
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

        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
                  Season one
                </p>

                <h2 className="mt-1 text-2xl font-bold">Current standings</h2>
              </div>

              <Link
                href="/leaderboard"
                className="text-sm font-semibold text-amber-400 hover:text-amber-300"
              >
                Full table
              </Link>
            </div>

            <div>
              {sortedStandings.slice(0, 5).map((standing, index) => (
                <div
                  key={standing.player.id}
                  className="grid grid-cols-[2rem_1fr_auto] items-center gap-4 border-b border-zinc-800 px-6 py-4 last:border-b-0"
                >
                  <span className="text-center font-bold text-zinc-500">
                    {index + 1}
                  </span>

                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: standing.player.colour,
                      }}
                    />

                    <span className="font-semibold">
                      {standing.player.shortName}
                    </span>
                  </div>

                  <span className="text-lg font-black">
                    {getTotal(standing.tournamentPoints)}
                    <span className="ml-1 text-xs font-semibold text-zinc-500">
                      pts
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-zinc-800 bg-zinc-900">
            <div className="border-b border-zinc-800 px-6 py-5">
              <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
                Recent matches
              </p>

              <h2 className="mt-1 text-2xl font-bold">Latest results</h2>
            </div>

            <div className="divide-y divide-zinc-800">
              {latestResults.map((result) => (
                <div
                  key={result.id}
                  className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-5"
                >
                  <span className="text-right font-semibold">
                    {result.playerOne}
                  </span>

                  <div className="rounded-lg bg-zinc-950 px-4 py-2 font-black text-amber-400">
                    {result.playerOneScore}–{result.playerTwoScore}
                  </div>

                  <span className="font-semibold">{result.playerTwo}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 px-6 py-5">
            <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
              Tournament {currentTournament.id}
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              {currentTournament.game} groups
            </h2>
          </div>

          <div className="grid gap-8 p-6 md:grid-cols-2">
            <GroupPreview title="Group A" players={groupAPlayers} />
            <GroupPreview title="Group B" players={groupBPlayers} />
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
              Season journey
            </p>

            <h2 className="mt-1 text-2xl font-bold">Tournament timeline</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tournaments.map((tournament, index) => {
              const isComplete = index < completedTournaments;
              const isCurrent = index === completedTournaments;

              return (
                <div
                  key={tournament.id}
                  className={`rounded-xl border p-4 ${
                    isCurrent
                      ? "border-amber-400 bg-amber-400/10"
                      : "border-zinc-800 bg-zinc-950"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-zinc-500">
                      T{tournament.id}
                    </span>

                    <span className="text-xs font-bold uppercase tracking-wider">
                      {isComplete
                        ? "Complete"
                        : isCurrent
                          ? "Current"
                          : "Upcoming"}
                    </span>
                  </div>

                  <p className="mt-4 font-bold">{tournament.game}</p>

                  <p className="mt-1 text-sm text-zinc-500">
                    Best of {tournament.bestOf}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

type GroupPreviewProps = {
  title: string;
  players: {
    id: string;
    shortName: string;
    colour: string;
  }[];
};

function GroupPreview({ title, players }: GroupPreviewProps) {
  return (
    <div>
      <h3 className="mb-4 text-lg font-bold">{title}</h3>

      <div className="space-y-3">
        {players.map((player, index) => (
          <div
            key={player.id}
            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="w-5 text-sm font-bold text-zinc-600">
                {index + 1}
              </span>

              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: player.colour }}
              />

              <span className="font-semibold">{player.shortName}</span>
            </div>

            <span className="text-sm text-zinc-600">0 pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
