import type { Player } from "@/types/competition";

export type GeneratedGroups = {
  groupA: Player[];
  groupB: Player[];
  drawOrder: Player[];
};

export function generateGroups(players: Player[]): GeneratedGroups {
  if (players.length !== 8) {
    throw new Error(
      `Group generation requires exactly 8 players. Received ${players.length}.`,
    );
  }

  const drawOrder = [...players];

  for (
    let currentIndex = drawOrder.length - 1;
    currentIndex > 0;
    currentIndex--
  ) {
    const randomIndex = Math.floor(Math.random() * (currentIndex + 1));

    [drawOrder[currentIndex], drawOrder[randomIndex]] = [
      drawOrder[randomIndex],
      drawOrder[currentIndex],
    ];
  }

  return {
    drawOrder,
    groupA: drawOrder.filter((_, playerIndex) => playerIndex % 2 === 0),
    groupB: drawOrder.filter((_, playerIndex) => playerIndex % 2 === 1),
  };
}
