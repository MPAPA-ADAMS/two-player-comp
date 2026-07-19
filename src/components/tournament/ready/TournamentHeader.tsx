import type { Tournament } from "@/types/competition";

type TournamentHeaderProps = {
  tournament: Tournament;
  status: Tournament["status"];
  groupsGenerated: boolean;
  groupStageComplete: boolean;
  tournamentComplete: boolean;
  onReset?: () => void;
};

export default function TournamentHeader({
  tournament,
  status,
  groupsGenerated,
  groupStageComplete,
  tournamentComplete,
  onReset,
}: TournamentHeaderProps) {
  let heading = "Ready for the group draw";
  let description =
    "Generate the two groups to create the complete round-robin schedule.";

  if (groupsGenerated) {
    heading = "Group stage in progress";
    description =
      "Enter match results below. The standings update automatically after every saved result.";
  }

  if (groupStageComplete) {
    heading = "Knockout stage";
    description =
      "The group stage is complete. The top two players from each group have qualified for the semifinals.";
  }

  if (tournamentComplete) {
    heading = "Tournament complete";
    description =
      "The final has been completed and the tournament winner has been confirmed.";
  }

  return (
    <header className="mb-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-400">
            Tournament {tournament.id}
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            {tournament.game}
          </h1>
          <p className="mt-3 text-zinc-400">Best of {tournament.bestOf}</p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          {groupsGenerated && onReset && (
            <button
              type="button"
              onClick={onReset}
              className="rounded-full border border-red-400/30 bg-red-400/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-300 transition hover:border-red-400/50 hover:bg-red-400/15"
            >
              Reset tournament
            </button>
          )}

          <TournamentStatusBadge status={status} />
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
          Tournament status
        </p>
        <h2 className="mt-2 text-2xl font-black">{heading}</h2>
        <p className="mt-3 max-w-3xl leading-7 text-zinc-400">{description}</p>
      </div>
    </header>
  );
}

type TournamentStatusBadgeProps = {
  status: Tournament["status"];
};

function TournamentStatusBadge({ status }: TournamentStatusBadgeProps) {
  const label = status.replaceAll("_", " ");

  const statusClasses: Record<Tournament["status"], string> = {
    LOCKED: "border-zinc-700 bg-zinc-800 text-zinc-400",
    READY: "border-amber-400/40 bg-amber-400/10 text-amber-400",
    IN_PROGRESS: "border-blue-400/40 bg-blue-400/10 text-blue-400",
    COMPLETED: "border-emerald-400/40 bg-emerald-400/10 text-emerald-400",
  };

  return (
    <span
      className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-widest ${statusClasses[status]}`}
    >
      {label}
    </span>
  );
}
