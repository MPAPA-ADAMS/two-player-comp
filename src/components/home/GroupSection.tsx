import PlayerLink from "@/components/players/PlayerLink";
import type { Player, Tournament } from "@/types/competition";

type GroupSectionProps = {
  tournament: Tournament;
  groupAPlayers: Player[];
  groupBPlayers: Player[];
};

export default function GroupSection({
  tournament,
  groupAPlayers,
  groupBPlayers,
}: GroupSectionProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900">
      <div className="border-b border-zinc-800 px-6 py-5">
        <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
          Tournament {tournament.id}
        </p>

        <h2 className="mt-1 text-2xl font-bold">{tournament.game} groups</h2>
      </div>

      <div className="grid gap-8 p-6 md:grid-cols-2">
        <GroupPreview title="Group A" players={groupAPlayers} />
        <GroupPreview title="Group B" players={groupBPlayers} />
      </div>
    </section>
  );
}

type GroupPreviewProps = {
  title: string;
  players: Player[];
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

              <PlayerLink player={player} className="font-semibold hover:text-amber-300 hover:underline">{player.shortName}</PlayerLink>
            </div>

            <span className="text-sm text-zinc-600">0 pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
