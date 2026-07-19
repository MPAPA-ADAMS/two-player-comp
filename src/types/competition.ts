export type Player = {
    id: string;
    name: string;
    shortName: string;
    colour: string;
};

export type Tournament = {
    id: number;
    name: string;
    game: string;
    bestOf: 1 | 3 | 5;
};

export type Match = {
    id: string;

    player1: Player;
    player2: Player;

    player1Rounds: number;
    player2Rounds: number;

    completed: boolean;
};

export type Group = {
    name: "A" | "B";

    players: Player[];

    matches: Match[];
};

export type SeasonStanding = {
  player: Player;
  tournamentPoints: number[];
  tournamentWins: number;
  runnerUpFinishes: number;
  semifinalFinishes: number;
};