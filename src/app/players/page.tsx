import PlayerCard from "@/components/ui/PlayerCard";
import { players } from "@/lib/mockData";

export default function PlayersPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-8 text-4xl font-bold">Players</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            name={player.name}
            colour={player.colour}
          />
        ))}
      </div>
    </main>
  );
}
