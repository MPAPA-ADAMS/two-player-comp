import type {
  Player,
  SeasonStanding,
  Tournament,
} from "@/types/competition";

export const players: Player[] = [
  {
    id: "player-1",
    name: "Michael",
    shortName: "Mike",
    colour: "#ef4444",
  },
  {
    id: "player-2",
    name: "Alexander",
    shortName: "Alex",
    colour: "#3b82f6",
  },
  {
    id: "player-3",
    name: "Thomas",
    shortName: "Tom",
    colour: "#22c55e",
  },
  {
    id: "player-4",
    name: "Benjamin",
    shortName: "Ben",
    colour: "#f59e0b",
  },
  {
    id: "player-5",
    name: "Jack",
    shortName: "Jack",
    colour: "#8b5cf6",
  },
  {
    id: "player-6",
    name: "Harry",
    shortName: "Harry",
    colour: "#06b6d4",
  },
  {
    id: "player-7",
    name: "Joshua",
    shortName: "Josh",
    colour: "#ec4899",
  },
  {
    id: "player-8",
    name: "Samuel",
    shortName: "Sam",
    colour: "#84cc16",
  },
];

export const tournaments: Tournament[] = [
  { id: 1, name: "Tournament 1", game: "Rocket League", bestOf: 3 },
  { id: 2, name: "Tournament 2", game: "Mario Kart", bestOf: 3 },
  { id: 3, name: "Tournament 3", game: "FIFA", bestOf: 5 },
  { id: 4, name: "Tournament 4", game: "Chess", bestOf: 1 },
  { id: 5, name: "Tournament 5", game: "Tekken", bestOf: 3 },
  { id: 6, name: "Tournament 6", game: "Pool", bestOf: 5 },
  { id: 7, name: "Tournament 7", game: "Table Tennis", bestOf: 3 },
  { id: 8, name: "Tournament 8", game: "Game to be decided", bestOf: 5 },
];

export const seasonStandings: SeasonStanding[] = [
  {
    player: players[0],
    tournamentPoints: [6, 3, 1, 0, 6, 0, 3, 0],
    tournamentWins: 2,
    runnerUpFinishes: 2,
    semifinalFinishes: 1,
  },
  {
    player: players[1],
    tournamentPoints: [3, 6, 0, 1, 0, 3, 0, 0],
    tournamentWins: 1,
    runnerUpFinishes: 2,
    semifinalFinishes: 1,
  },
  {
    player: players[2],
    tournamentPoints: [1, 0, 6, 3, 1, 1, 0, 0],
    tournamentWins: 1,
    runnerUpFinishes: 1,
    semifinalFinishes: 3,
  },
  {
    player: players[3],
    tournamentPoints: [0, 1, 3, 6, 0, 0, 1, 0],
    tournamentWins: 1,
    runnerUpFinishes: 1,
    semifinalFinishes: 2,
  },
  {
    player: players[4],
    tournamentPoints: [1, 0, 0, 0, 3, 6, 0, 0],
    tournamentWins: 1,
    runnerUpFinishes: 1,
    semifinalFinishes: 1,
  },
  {
    player: players[5],
    tournamentPoints: [0, 1, 1, 0, 0, 3, 6, 0],
    tournamentWins: 1,
    runnerUpFinishes: 1,
    semifinalFinishes: 2,
  },
  {
    player: players[6],
    tournamentPoints: [0, 0, 0, 1, 0, 1, 1, 0],
    tournamentWins: 0,
    runnerUpFinishes: 0,
    semifinalFinishes: 3,
  },
  {
    player: players[7],
    tournamentPoints: [0, 0, 0, 0, 1, 0, 0, 0],
    tournamentWins: 0,
    runnerUpFinishes: 0,
    semifinalFinishes: 1,
  },
];

export const groupAPlayers = players.slice(0, 4);
export const groupBPlayers = players.slice(4, 8);