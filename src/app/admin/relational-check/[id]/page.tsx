import { notFound } from "next/navigation";

import { getRelationalTournament } from "@/lib/competition/queries/get-relational-tournament";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RelationalCheckPage({ params }: PageProps) {
  const { id } = await params;
  const tournamentId = Number(id);

  if (!Number.isInteger(tournamentId) || tournamentId <= 0) {
    notFound();
  }

  const tournament = await getRelationalTournament(tournamentId);

  if (!tournament) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header>
        <p className="text-sm text-zinc-500">Relational database check</p>

        <h1 className="text-3xl font-bold">{tournament.name}</h1>

        <p className="mt-2 text-zinc-600">
          {tournament.game} · Best of {tournament.bestOf} · {tournament.status}
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {tournament.groups.map((group) => (
          <article key={group.id} className="rounded-xl border p-5">
            <h2 className="mb-4 text-xl font-semibold">Group {group.name}</h2>

            {group.entries.length === 0 ? (
              <p className="text-sm text-zinc-500">
                No players have been assigned.
              </p>
            ) : (
              <ol className="space-y-2">
                {group.entries.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between"
                  >
                    <span>{entry.player.name}</span>
                    <span className="text-sm text-zinc-500">
                      Seed {entry.seed}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </article>
        ))}
      </section>

      <section className="rounded-xl border p-5">
        <h2 className="mb-4 text-xl font-semibold">Matches</h2>

        {tournament.matches.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No relational matches exist for this tournament.
          </p>
        ) : (
          <div className="space-y-3">
            {tournament.matches.map((match) => (
              <div
                key={match.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 last:border-b-0"
              >
                <div>
                  <p className="font-medium">
                    {match.player1.name} vs {match.player2.name}
                  </p>

                  <p className="text-sm text-zinc-500">
                    {match.stage}
                    {match.group ? ` · Group ${match.group.name}` : ""}
                    {" · "}
                    Round {match.round}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold">
                    {match.player1Rounds}–{match.player2Rounds}
                  </p>

                  <p className="text-sm text-zinc-500">
                    {match.completed
                      ? `Winner: ${match.winner?.name ?? "Unknown"}`
                      : "Not completed"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border p-5">
        <h2 className="mb-4 text-xl font-semibold">Mentor draft</h2>

        {!tournament.mentorDraft ? (
          <p className="text-sm text-zinc-500">No mentor draft exists.</p>
        ) : (
          <div className="space-y-2">
            {tournament.mentorDraft.picks.map((pick) => (
              <div key={pick.id} className="flex justify-between">
                <span>
                  #{pick.pickNumber} {pick.player.name}
                </span>

                <span>{pick.mentor.name}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
