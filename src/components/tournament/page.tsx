import ReadyTournament from "@/components/tournament/ReadyTournament";
import {
  loadActiveSeasonTournaments,
  loadCompetitionPlayers,
} from "@/lib/competition/database/loadTournamentPages";

export const dynamic = "force-dynamic";

export default async function TournamentsPage() {
  const [tournaments, players] = await Promise.all([
    loadActiveSeasonTournaments(),
    loadCompetitionPlayers(),
  ]);

  const readyTournament = tournaments.find(
    (tournament) => tournament.status === "READY",
  );

  if (!readyTournament) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
            Tournament status
          </p>

          <h1 className="mt-3 text-3xl font-black">
            No tournament is ready for a draw
          </h1>

          <p className="mt-3 text-zinc-400">
            The next tournament will unlock after the current one is completed.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <ReadyTournament
        tournament={readyTournament}
        tournaments={tournaments}
        players={players}
      />
    </main>
  );
}
