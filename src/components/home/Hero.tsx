import Link from "next/link";

export default function Hero() {
  return (
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
            Eight players. Eight tournaments. One season champion.
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
  );
}
