import Link from "next/link";
import type { MentorStanding } from "@/lib/competition/mentors";

export default function MentorSpotlight({
  standings,
  currentDraftPicks,
  currentDraftComplete,
}: {
  standings: MentorStanding[];
  currentDraftPicks: number;
  currentDraftComplete: boolean;
}) {
  const leader = standings[0];

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
      <div className="flex flex-col gap-4 border-b border-zinc-800 px-5 py-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">
            Mentor championship
          </p>
          <h2 className="mt-2 text-2xl font-black">The draft race</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Sam, Jason and Karthi score points through the players they draft each tournament.
          </p>
        </div>

        <Link
          href="/mentors"
          className="inline-flex shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm font-black text-amber-300 transition hover:bg-amber-400/20"
        >
          View mentor stats
        </Link>
      </div>

      <div className="grid gap-px bg-zinc-800 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="bg-zinc-900 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            Current leader
          </p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-3xl font-black">{leader?.mentor.name ?? "No leader yet"}</p>
              <p className="mt-1 text-sm text-zinc-500">
                {leader ? `${leader.tournamentWins} draft win${leader.tournamentWins === 1 ? "" : "s"}` : "Complete a drafted tournament to score"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-amber-400">{leader?.points ?? 0}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">points</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Current draft
            </p>
            <p className="mt-2 font-black">
              {currentDraftComplete
                ? "Draft complete"
                : currentDraftPicks > 0
                  ? `${currentDraftPicks} of 8 picks made`
                  : "Waiting for the group draw"}
            </p>
          </div>
        </article>

        <div className="bg-zinc-900 p-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">
            Overall standings
          </p>
          <div className="space-y-2">
            {standings.map((row, index) => (
              <div
                key={row.mentor.id}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-sm font-black text-zinc-400">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-black">{row.mentor.name}</p>
                    <p className="text-xs text-zinc-500">Best draft: {row.bestDraft} pts</p>
                  </div>
                </div>
                <p className="text-xl font-black text-amber-400">{row.points}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
