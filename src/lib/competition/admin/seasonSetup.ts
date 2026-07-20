export type SeasonSetupPlayerInput = {
  name: string;
  shortName: string;
  colour: string;
};

export type SeasonSetupInput = {
  name: string;
  number: number;
  games: string[];
  mentors: string[];
  players: SeasonSetupPlayerInput[];
};