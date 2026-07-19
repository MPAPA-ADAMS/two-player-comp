import { notFound } from "next/navigation";
import PlayerProfilePage from "@/components/players/PlayerProfilePage";
import { players } from "@/lib/mockData";

type PlayerRouteProps = { params: Promise<{ id: string }> };

export default async function PlayerRoute({ params }: PlayerRouteProps) {
  const { id } = await params;
  const player = players.find((entry) => entry.id === id);
  if (!player) notFound();
  return <PlayerProfilePage player={player} />;
}
