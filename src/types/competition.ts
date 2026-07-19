export type Player = {
  id: string;
  name: string;
  shortName: string;
  colour: string;
};

export type TournamentStatus =
  | "LOCKED"
  | "READY"
  | "IN_PROGRESS"
  | "COMPLETED";

export type Tournament = {
  id: number;
  name: string;
  game: string;
  bestOf: 1 | 3 | 5;
  status: TournamentStatus;
};

export type MatchStage =
  | "GROUP"
  | "SEMIFINAL"
  | "FINAL"
  | "TIEBREAK";

export type Match = {
  id: string;
  round: number;
  stage: MatchStage;
  group?: "A" | "B";
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

export type Round = {
  number: number;
  matches: Match[];
};