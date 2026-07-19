import type { Match, Player } from "@/types/competition";

export type FixtureRound = {
  number: number;
  matches: Match[];
};

type GroupName = "A" | "B";

export function generateGroupFixtures(
  players: Player[],
  group: GroupName,
  tournamentId: number,
): FixtureRound[] {
  if (players.length !== 4) {
    throw new Error(
      `Fixture generation requires exactly 4 players. Received ${players.length}.`,
    );
  }

  const [player1, player2, player3, player4] = players;

  return [
    {
      number: 1,
      matches: [
        createGroupMatch({
          id: `t${tournamentId}-${group.toLowerCase()}-r1-m1`,
          round: 1,
          group,
          player1,
          player2,
        }),
        createGroupMatch({
          id: `t${tournamentId}-${group.toLowerCase()}-r1-m2`,
          round: 1,
          group,
          player1: player3,
          player2: player4,
        }),
      ],
    },
    {
      number: 2,
      matches: [
        createGroupMatch({
          id: `t${tournamentId}-${group.toLowerCase()}-r2-m1`,
          round: 2,
          group,
          player1,
          player2: player3,
        }),
        createGroupMatch({
          id: `t${tournamentId}-${group.toLowerCase()}-r2-m2`,
          round: 2,
          group,
          player1: player2,
          player2: player4,
        }),
      ],
    },
    {
      number: 3,
      matches: [
        createGroupMatch({
          id: `t${tournamentId}-${group.toLowerCase()}-r3-m1`,
          round: 3,
          group,
          player1,
          player2: player4,
        }),
        createGroupMatch({
          id: `t${tournamentId}-${group.toLowerCase()}-r3-m2`,
          round: 3,
          group,
          player1: player2,
          player2: player3,
        }),
      ],
    },
  ];
}

type CreateGroupMatchArguments = {
  id: string;
  round: number;
  group: GroupName;
  player1: Player;
  player2: Player;
};

function createGroupMatch({
  id,
  round,
  group,
  player1,
  player2,
}: CreateGroupMatchArguments): Match {
  return {
    id,
    round,
    stage: "GROUP",
    group,
    player1,
    player2,
    player1Rounds: 0,
    player2Rounds: 0,
    completed: false,
  };
}