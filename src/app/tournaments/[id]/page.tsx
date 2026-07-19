import { notFound } from "next/navigation";
import CompletedTournament from "@/components/tournament/CompletedTournament";
import TournamentRuntime from "@/components/tournament/runtime/TournamentRuntime";
import { getTournamentHistory, players, tournaments } from "@/lib/mockData";

type TournamentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TournamentPage({ params }: TournamentPageProps) {
  const { id } = await params;
  const tournamentId = Number(id);

  if (!Number.isInteger(tournamentId)) {
    notFound();
  }

  const tournament = tournaments.find((item) => item.id === tournamentId);

  if (!tournament) {
    notFound();
  }

  const history = getTournamentHistory(tournament.id);

  if (tournament.status === "COMPLETED" && history) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <CompletedTournament history={history} />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <TournamentRuntime
        tournament={tournament}
        tournaments={tournaments}
        players={players}
      />
    </main>
  );
}
