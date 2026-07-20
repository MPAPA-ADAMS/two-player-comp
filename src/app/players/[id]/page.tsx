import { notFound } from "next/navigation";

import PlayerProfilePage from "@/components/players/PlayerProfilePage";
import { loadActiveSeasonTournaments } from "@/lib/competition/database/loadTournamentPages";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PlayerRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PlayerRoute({ params }: PlayerRouteProps) {
  const { id } = await params;

  const [player, tournaments] = await Promise.all([
    prisma.player.findUnique({
      where: {
        id,
      },
    }),
    loadActiveSeasonTournaments(),
  ]);

  if (!player) {
    notFound();
  }

  return <PlayerProfilePage player={player} tournaments={tournaments} />;
}
