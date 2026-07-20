import "dotenv/config";

import prisma from "../src/lib/prisma";
import { TournamentStatus } from "../src/generated/prisma/client";

const gamePool = [
  { game: "7 Wonders Duel", bestOf: 3 },
  { game: "Air, Land & Sea", bestOf: 5 },
  { game: "Azul", bestOf: 3 },
  { game: "Blokus Duo", bestOf: 3 },
  { game: "Carcassonne", bestOf: 1 },
  { game: "Catan", bestOf: 1 },
  { game: "Hive", bestOf: 5 },
  { game: "Jaipur", bestOf: 3 },
  { game: "Kingdomino", bestOf: 3 },
  { game: "Lost Cities", bestOf: 3 },
  { game: "Onitama", bestOf: 5 },
  { game: "Patchwork", bestOf: 3 },
  { game: "Quoridor", bestOf: 3 },
  { game: "Santorini", bestOf: 3 },
  { game: "Splendor Duel", bestOf: 3 },
  { game: "Tak", bestOf: 5 },
  { game: "Targi", bestOf: 3 },
  { game: "Ticket to Ride", bestOf: 1 },
  { game: "Watergate", bestOf: 3 },
];

const tournaments = [...gamePool]
  .sort(() => Math.random() - 0.5)
  .slice(0, 8)
  .map((game, index) => ({
    id: index + 1,
    name: `Tournament ${index + 1}`,
    game: game.game,
    bestOf: game.bestOf,
  }));

async function main() {
  const result = await prisma.$transaction(
    async (transaction) => {
      /*
       * Deleting seasons cascades through:
       *
       * Season
       * └── Tournament
       *     ├── TournamentGroup
       *     │   └── GroupEntry
       *     ├── Match
       *     └── MentorDraft
       *         ├── MentorDraftTurn
       *         └── MentorDraftPick
       *
       * Player and Mentor records are preserved.
       */
      await transaction.season.deleteMany();

      const season = await transaction.season.create({
        data: {
          name: "Season 2",
          number: 2,
          isActive: true,
        },
      });

      await transaction.tournament.createMany({
        data: tournaments.map((tournament) => ({
          id: tournament.id,
          seasonId: season.id,
          name: tournament.name,
          game: tournament.game,
          bestOf: tournament.bestOf,
          status:
            tournament.id === 1
              ? TournamentStatus.READY
              : TournamentStatus.LOCKED,
        })),
      });

      return season;
    },
  );

  console.log(
    `Created ${result.name} with tournaments 1–8.`,
  );
  console.log("Tournament 1 is READY.");
  console.log("Tournaments 2–8 are LOCKED.");
  console.log("Players and mentors were preserved.");
}

main().catch((error: unknown) => {
  console.error(
    "Failed to create the new season:",
    error,
  );

  process.exitCode = 1;
});