import type { Tournament } from "@/types/competition";

type TournamentTimelineProps = {
  tournaments: Tournament[];
  completedTournaments: number;
};

export default function TournamentTimeline({
  tournaments,
  completedTournaments,
}: TournamentTimelineProps) {
  return (
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
                  {isComplete ? "Complete" : isCurrent ? "Current" : "Upcoming"}
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
  );
}
