export type HistoricalMatchInput = {
  player1: string;
  player2: string;
  player1Rounds: number;
  player2Rounds: number;
};

export const tournamentOneData = {
  /*
   * Use player short names exactly as entered during season setup.
   */
  groupA: [
    "Louis",
    "Keetch",
    "Dymock",
    "Sam",
  ],

  groupB: [
    "Papa",
    "Henry",
    "Aiden",
    "Daniel",
  ],

  groupAMatches: [
    {
      player1: "Louis",
      player2: "Keetch",
      player1Rounds: 2,
      player2Rounds: 0,
    },
    {
      player1: "Dymock",
      player2: "Sam",
      player1Rounds: 2,
      player2Rounds: 1,
    },
    {
      player1: "Louis",
      player2: "Dymock",
      player1Rounds: 2,
      player2Rounds: 0,
    },
    {
      player1: "Keetch",
      player2: "Sam",
      player1Rounds: 0,
      player2Rounds: 2,
    },
    {
      player1: "Louis",
      player2: "Sam",
      player1Rounds: 1,
      player2Rounds: 2,
    },
    {
      player1: "Keetch",
      player2: "Dymock",
      player1Rounds: 1,
      player2Rounds: 2,
    },

    /*
     * Add all six Group A matches.
     */
  ] satisfies HistoricalMatchInput[],

  groupBMatches: [
    {
      player1: "Papa",
      player2: "Henry",
      player1Rounds: 2,
      player2Rounds: 1,
    },  
    {
      player1: "Daniel",
      player2: "Aiden",
      player1Rounds: 2,
      player2Rounds: 0,
    },  
    {
      player1: "Papa",
      player2: "Daniel",
      player1Rounds: 1,
      player2Rounds: 2,
    },
    {
      player1: "Papa",
      player2: "Aiden",
      player1Rounds: 0,
      player2Rounds: 2,
    },  
    {
      player1: "Henry",
      player2: "Daniel",
      player1Rounds: 2,
      player2Rounds: 1,
    },  
    {
      player1: "Henry",
      player2: "Aiden",
      player1Rounds: 0,
      player2Rounds: 2,
    },

    /*
     * Add all six Group B matches.
     */
  ] satisfies HistoricalMatchInput[],

  semifinals: [
    {
      player1: "Louis",
      player2: "Aiden",
      player1Rounds: 0,
      player2Rounds: 2,
    },
    {
      player1: "Daniel",
      player2: "Sam",
      player1Rounds: 2,
      player2Rounds: 1,
    },
  ] satisfies HistoricalMatchInput[],

  final: {
    player1: "Aiden",
    player2: "Daniel",
    player1Rounds: 2,
    player2Rounds: 0,
  } satisfies HistoricalMatchInput,
};