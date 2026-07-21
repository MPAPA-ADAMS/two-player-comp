import "dotenv/config";
import type {
  CompetitionState,
} from "../src/lib/competition/engine";
import {
  generateGroupFixtures,
  type FixtureRound,
} from "../src/lib/competition/fixture";
import {
  saveCompetitionStateToDatabase,
} from "../src/lib/competition/database/saveCompetitionState";
import prisma from "../src/lib/prisma";
import type {
  Match,
  Player,
} from "../src/types/competition";

import {
  tournamentOneData,
  type HistoricalMatchInput,
} from "./data/tournament-1";

async function main(): Promise<void> {
  const tournament =
    await prisma.tournament.findFirst({
      where: {
        season: {
          isActive: true,
        },
      },
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        name: true,
        bestOf: true,
      },
    });

    

  if (!tournament) {
    throw new Error(
      "No tournament exists in the active season.",
    );
  }

  const players = await prisma.player.findMany({
    where: {
      active: true,
    },
    select: {
      id: true,
      name: true,
      shortName: true,
      colour: true,
    },
  });

  const playerByShortName = new Map(
    players.map((player) => [
      player.shortName.toLocaleLowerCase(),
      player,
    ]),
  );

  function getPlayer(shortName: string): Player {
    const player = playerByShortName.get(
      shortName.trim().toLocaleLowerCase(),
    );

    if (!player) {
      throw new Error(
        `No active player has short name "${shortName}".`,
      );
    }

    return player;
  }

  const groupAPlayers =
    tournamentOneData.groupA.map(getPlayer);

  const groupBPlayers =
    tournamentOneData.groupB.map(getPlayer);

  assertFourUniquePlayers(
    groupAPlayers,
    "Group A",
  );

  assertFourUniquePlayers(
    groupBPlayers,
    "Group B",
  );

  const allGroupPlayerIds = [
    ...groupAPlayers,
    ...groupBPlayers,
  ].map((player) => player.id);

  if (
    new Set(allGroupPlayerIds).size !==
    allGroupPlayerIds.length
  ) {
    throw new Error(
      "A player cannot appear in both groups.",
    );
  }

  const groupAFixtures = applyHistoricalScores(
    generateGroupFixtures(
      groupAPlayers,
      "A",
      tournament.id,
    ),
    tournamentOneData.groupAMatches,
    getPlayer,
    "Group A",
  );

  const groupBFixtures = applyHistoricalScores(
    generateGroupFixtures(
      groupBPlayers,
      "B",
      tournament.id,
    ),
    tournamentOneData.groupBMatches,
    getPlayer,
    "Group B",
  );

  const semifinals = tournamentOneData.semifinals.map(
    (match, index) =>
      createCompletedMatch({
        input: match,
        id: `tournament-${tournament.id}-semifinal-${index + 1}`,
        stage: "SEMIFINAL",
        round: index + 1,
        getPlayer,
      }),
  );

  if (semifinals.length !== 2) {
    throw new Error(
      "Exactly two semifinals are required.",
    );
  }

  const finalMatch = createCompletedMatch({
    input: tournamentOneData.final,
    id: `tournament-${tournament.id}-final`,
    stage: "FINAL",
    round: 1,
    getPlayer,
  });

  const state: CompetitionState = {
    tournamentId: tournament.id,
    groupAPlayers,
    groupBPlayers,
    groupAFixtures,
    groupBFixtures,
    semifinals,
    finalMatch,

    /*
     * Tournament 1 was played before mentors were introduced.
     */
    mentorDraft: null,
    mentorDraftSkipped: true,
  };

  await saveCompetitionStateToDatabase(state);

  console.log(
    `Imported completed data for ${tournament.name}.`,
  );
  console.log(
    "No mentor draft records were created.",
  );
}

function applyHistoricalScores(
  fixtures: FixtureRound[],
  results: HistoricalMatchInput[],
  getPlayer: (shortName: string) => Player,
  label: string,
): FixtureRound[] {
  if (results.length !== 6) {
    throw new Error(
      `${label} requires exactly six results.`,
    );
  }

  const resultsByPlayers = new Map(
    results.map((result) => [
      createPairKey(
        getPlayer(result.player1).id,
        getPlayer(result.player2).id,
      ),
      result,
    ]),
  );

  return fixtures.map((round) => ({
    ...round,
    matches: round.matches.map((match) => {
      const key = createPairKey(
        match.player1.id,
        match.player2.id,
      );

      const result = resultsByPlayers.get(key);

      if (!result) {
        throw new Error(
          `${label} is missing the match between ` +
          `${match.player1.shortName} and ${match.player2.shortName}.`,
        );
      }

      const inputPlayer1 =
        getPlayer(result.player1);

      const scoresAreReversed =
        inputPlayer1.id === match.player2.id;

      const player1Rounds = scoresAreReversed
        ? result.player2Rounds
        : result.player1Rounds;

      const player2Rounds = scoresAreReversed
        ? result.player1Rounds
        : result.player2Rounds;

      validateCompletedScore(
        player1Rounds,
        player2Rounds,
      );

      return {
        ...match,
        player1Rounds,
        player2Rounds,
        completed: true,
      };
    }),
  }));
}

function createCompletedMatch({
  input,
  id,
  stage,
  round,
  getPlayer,
}: {
  input: HistoricalMatchInput;
  id: string;
  stage: "SEMIFINAL" | "FINAL";
  round: number;
  getPlayer: (shortName: string) => Player;
}): Match {
  validateCompletedScore(
    input.player1Rounds,
    input.player2Rounds,
  );

  return {
    id,
    stage,
    round,
    player1: getPlayer(input.player1),
    player2: getPlayer(input.player2),
    player1Rounds: input.player1Rounds,
    player2Rounds: input.player2Rounds,
    completed: true,
  };
}

function createPairKey(
  player1Id: string,
  player2Id: string,
): string {
  return [player1Id, player2Id]
    .sort()
    .join(":");
}

function validateCompletedScore(
  player1Rounds: number,
  player2Rounds: number,
): void {
  if (
    !Number.isInteger(player1Rounds) ||
    !Number.isInteger(player2Rounds) ||
    player1Rounds < 0 ||
    player2Rounds < 0
  ) {
    throw new Error(
      "Match scores must be non-negative integers.",
    );
  }

  if (player1Rounds === player2Rounds) {
    throw new Error(
      "A completed match cannot be tied.",
    );
  }
}

function assertFourUniquePlayers(
  players: Player[],
  label: string,
): void {
  if (players.length !== 4) {
    throw new Error(
      `${label} requires exactly four players.`,
    );
  }

  if (
    new Set(
      players.map((player) => player.id),
    ).size !== 4
  ) {
    throw new Error(
      `${label} contains duplicate players.`,
    );
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });