export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-zinc-400">
          2 Player Competition
        </p>

        <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-7xl">
          Eight players. Eight tournaments. One season champion.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
          Follow every group-stage match, knockout result, and season point
          across the full competition.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="/leaderboard"
            className="rounded-lg bg-white px-5 py-3 font-semibold text-black"
          >
            View leaderboard
          </a>

          <a
            href="/tournaments"
            className="rounded-lg border border-zinc-700 px-5 py-3 font-semibold"
          >
            View tournaments
          </a>
        </div>
      </section>
    </main>
  );
}
