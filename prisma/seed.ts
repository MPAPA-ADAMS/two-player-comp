import prisma from "../src/lib/prisma";
import { TournamentStatus } from "../src/generated/prisma/client";

const gamePool = [
  { game: "Catan", bestOf: 1 },
  { game: "Carcassonne", bestOf: 1 },
  { game: "Ticket to Ride", bestOf: 1 },
  { game: "Azul", bestOf: 3 },
  { game: "7 Wonders Duel", bestOf: 3 },
  { game: "Patchwork", bestOf: 3 },
  { game: "Splendor Duel", bestOf: 3 },
  { game: "Hive", bestOf: 5 },
  { game: "Santorini", bestOf: 3 },
  { game: "Jaipur", bestOf: 3 },
  { game: "Lost Cities", bestOf: 3 },
  { game: "Kingdomino", bestOf: 3 },
  { game: "Quoridor", bestOf: 3 },
  { game: "Blokus Duo", bestOf: 3 },
  { game: "Tak", bestOf: 5 },
  { game: "Onitama", bestOf: 5 },
  { game: "Targi", bestOf: 3 },
  { game: "Watergate", bestOf: 3 },
  { game: "Air, Land & Sea", bestOf: 5 },
  { game: "Radlands", bestOf: 5 },
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

async function main(): Promise<void> {
  const season = await prisma.$transaction(
    async (transaction) => {
      /*
       * This removes all competition progress while preserving
       * Player and Mentor records.
       *
       * Tournament deletion cascades to:
       * - TournamentGroup
       * - GroupEntry
       * - Match
       * - MentorDraft
       * - MentorDraftTurn
       * - MentorDraftPick
       */
      await transaction.tournament.deleteMany();
      await transaction.season.deleteMany();

      const newSeason = await transaction.season.create({
        data: {
          name: "Season 2",
          number: 2,
          isActive: true,
        },
      });

      await transaction.tournament.createMany({
        data: tournaments.map((tournament) => ({
          id: tournament.id,
          seasonId: newSeason.id,
          name: tournament.name,
          game: tournament.game,
          bestOf: tournament.bestOf,
          status:
            tournament.id === 1
              ? TournamentStatus.READY
              : TournamentStatus.LOCKED,
        })),
      });

      return newSeason;
    },
  );

  console.log(
    `Created ${season.name} with 8 empty tournaments.`,
  );
  console.log("Tournament 1 is READY.");
  console.log("Tournaments 2–8 are LOCKED.");
  console.log("Players and mentors were preserved.");
}

main()
  .catch((error: unknown) => {
    console.error("Unable to seed fresh season.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });