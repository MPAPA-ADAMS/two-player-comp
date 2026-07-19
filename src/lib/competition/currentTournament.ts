import type { Tournament } from "@/types/competition";

export const CURRENT_TOURNAMENT_ID = 4 as Tournament["id"];

export function getCurrentTournamentHref(): string {
  return `/tournaments/${CURRENT_TOURNAMENT_ID}`;
}
