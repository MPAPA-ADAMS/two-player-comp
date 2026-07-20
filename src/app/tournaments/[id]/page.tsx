import { notFound } from "next/navigation";

import TournamentRuntime from "@/components/tournament/runtime/TournamentRuntime";
import { loadTournamentPageData } from "@/lib/competition/database/loadTournamentPages";

export const dynamic = "force-dynamic";

type TournamentPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TournamentPage({ params }: TournamentPageProps) {
  const { id } = await params;
  const tournamentId = Number(id);

  if (!Number.isInteger(tournamentId) || tournamentId < 1) {
    notFound();
  }

  const { tournament, tournaments, players } =
    await loadTournamentPageData(tournamentId);

  if (!tournament) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <TournamentRuntime
        tournament={tournament}
        tournaments={tournaments}
        players={players}
        editable={false}
      />
    </main>
  );
}
