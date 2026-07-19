import { getMatchLoser, getMatchWinner } from "@/lib/competition/bracket";
import type { Match, Player } from "@/types/competition";

type TournamentResultProps = {
  finalMatch: Match;
  semifinals: Match[];
};

export default function TournamentResult({
  finalMatch,
  semifinals,
}: TournamentResultProps) {
  const champion = getMatchWinner(finalMatch);
  const runnerUp = getMatchLoser(finalMatch);
  const losingSemifinalists = semifinals.map((match) => getMatchLoser(match));

  return (
    <section className="overflow-hidden rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-400/15 via-zinc-900 to-zinc-900">
      <div className="p-6 text-center sm:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-amber-400">
          Tournament champion
        </p>

        <div
          className="mx-auto mt-6 h-20 w-20 rounded-full border-4 border-amber-400"
          style={{ backgroundColor: champion.colour }}
        />

        <h2 className="mt-5 text-4xl font-black sm:text-5xl">
          {champion.name}
        </h2>
        <p className="mt-2 text-zinc-400">
          Defeated {runnerUp.name} {finalMatch.player1Rounds}–
          {finalMatch.player2Rounds} in the final.
        </p>

        <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
          <PlacementCard label="Winner" player={champion} points={6} />
          <PlacementCard label="Runner-up" player={runnerUp} points={3} />

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Semifinalists
            </p>
            <div className="mt-3 space-y-2">
              {losingSemifinalists.map((player) => (
                <p key={player.id} className="font-bold">
                  {player.name}
                  <span className="ml-2 text-amber-400">+1</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlacementCard({
  label,
  player,
  points,
}: {
  label: string;
  player: Player;
  points: number;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
        {label}
      </p>
      <p className="mt-3 text-lg font-black">{player.name}</p>
      <p className="mt-1 font-bold text-amber-400">+{points} points</p>
    </div>
  );
}
