export type LatestResult = {
  id: string;
  playerOne: string;
  playerOneScore: number;
  playerTwo: string;
  playerTwoScore: number;
};

type LatestResultsProps = {
  results: LatestResult[];
};

export default function LatestResults({ results }: LatestResultsProps) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900">
      <div className="border-b border-zinc-800 px-6 py-5">
        <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
          Recent matches
        </p>

        <h2 className="mt-1 text-2xl font-bold">Latest results</h2>
      </div>

      <div className="divide-y divide-zinc-800">
        {results.map((result) => (
          <div
            key={result.id}
            className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-5"
          >
            <span className="text-right font-semibold">{result.playerOne}</span>

            <div className="rounded-lg bg-zinc-950 px-4 py-2 font-black text-amber-400">
              {result.playerOneScore}–{result.playerTwoScore}
            </div>

            <span className="font-semibold">{result.playerTwo}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
