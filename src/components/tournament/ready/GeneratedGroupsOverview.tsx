import PlayerLink from "@/components/players/PlayerLink";
import type { StandingRow } from "@/lib/competition/standings";

type GroupName = "A" | "B";

type GeneratedGroupsOverviewProps = {
  groupAStandings: StandingRow[];
  groupBStandings: StandingRow[];
  groupAComplete: boolean;
  groupBComplete: boolean;
};

export default function GeneratedGroupsOverview({
  groupAStandings,
  groupBStandings,
  groupAComplete,
  groupBComplete,
}: GeneratedGroupsOverviewProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-400">
            Groups confirmed
          </p>
          <h2 className="mt-2 text-2xl font-black">Group stage overview</h2>
          <p className="mt-2 text-sm text-zinc-400">
            The top two players from each group qualify for the semifinals.
          </p>
        </div>

        <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Draw complete
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <CompactGroupStandings
          group="A"
          standings={groupAStandings}
          completed={groupAComplete}
        />
        <CompactGroupStandings
          group="B"
          standings={groupBStandings}
          completed={groupBComplete}
        />
      </div>
    </section>
  );
}

type CompactGroupStandingsProps = {
  group: GroupName;
  standings: StandingRow[];
  completed: boolean;
};

function CompactGroupStandings({
  group,
  standings,
  completed,
}: CompactGroupStandingsProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Group {group}
          </p>
          <h3 className="mt-1 text-xl font-black">Standings</h3>
        </div>
        <span
          className={
            completed
              ? "text-sm font-semibold text-emerald-400"
              : "text-sm text-zinc-500"
          }
        >
          {completed ? "Complete" : "In progress"}
        </span>
      </div>

      <div>
        {standings.map((standing) => {
          const qualifying = standing.position <= 2;

          return (
            <div
              key={standing.player.id}
              className={`grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 border-t border-zinc-800 px-4 py-4 first:border-t-0 ${
                qualifying ? "bg-emerald-400/5" : ""
              }`}
            >
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${
                  qualifying
                    ? "bg-emerald-400 text-zinc-950"
                    : "bg-zinc-900 text-zinc-400"
                }`}
              >
                {standing.position}
              </span>

              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: standing.player.colour }}
                />
                <div className="min-w-0">
                  <p className="truncate font-bold"><PlayerLink player={standing.player}>{standing.player.name}</PlayerLink></p>
                  <p className="text-xs text-zinc-500">
                    {standing.player.shortName}
                  </p>
                </div>
              </div>

              <StandingStat label="W" value={standing.wins} />
              <StandingStat
                label="RD"
                value={
                  standing.roundDifference > 0
                    ? `+${standing.roundDifference}`
                    : standing.roundDifference
                }
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

type StandingStatProps = {
  label: string;
  value: string | number;
};

function StandingStat({ label, value }: StandingStatProps) {
  return (
    <div className="min-w-10 text-center">
      <p className="text-xs uppercase text-zinc-600">{label}</p>
      <p className="font-black">{value}</p>
    </div>
  );
}
