import HomeDashboard from "@/components/home/HomeDashboard";
import {
  loadActiveSeasonTournaments,
  loadCompetitionPlayers,
} from "@/lib/competition/database/loadTournamentPages";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [tournaments, players] = await Promise.all([
    loadActiveSeasonTournaments(),
    loadCompetitionPlayers(),
  ]);

  return <HomeDashboard tournaments={tournaments} players={players} />;
}
