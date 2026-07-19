import { getMatchLoser, getMatchWinner } from "@/lib/competition/bracket";
import type { CompetitionState } from "@/lib/competition/engine";
import type { Match, MatchStage, Player, Tournament } from "@/types/competition";

export type PlayerFixture = {
  tournamentId: number;
  match: Match;
  opponent: Player;
  won: boolean;
  roundsFor: number;
  roundsAgainst: number;
};

export type StageRecord = {
  stage: MatchStage;
  played: number;
  wins: number;
  losses: number;
  roundsFor: number;
  roundsAgainst: number;
};

export type OpponentRecord = {
  opponent: Player;
  played: number;
  wins: number;
  losses: number;
  roundsFor: number;
  roundsAgainst: number;
};

export type PlayerTournamentRecord = {
  tournament: Tournament;
  played: boolean;
  finish: "Winner" | "Runner-up" | "Semifinal" | "Group stage" | "In progress" | "Not played";
  points: number;
  matches: number;
  wins: number;
  losses: number;
  roundsFor: number;
  roundsAgainst: number;
};

export type PlayerProfileStats = {
  player: Player;
  fixtures: PlayerFixture[];
  tournaments: PlayerTournamentRecord[];
  stageRecords: StageRecord[];
  opponentRecords: OpponentRecord[];
  tournamentPoints: number;
  titles: number;
  runnerUps: number;
  semifinals: number;
  tournamentsPlayed: number;
  matchWins: number;
  matchLosses: number;
  roundsWon: number;
  roundsLost: number;
  longestWinStreak: number;
  currentWinStreak: number;
  winRate: number;
  roundDifference: number;
  bestOpponent: OpponentRecord | null;
  toughestOpponent: OpponentRecord | null;
};

export function buildPlayerProfileStats(
  player: Player,
  states: CompetitionState[],
  tournaments: Tournament[],
): PlayerProfileStats {
  const fixtures = states
    .flatMap((state) => getCompletedMatches(state).map((match) => toFixture(player, state.tournamentId, match)))
    .filter((fixture): fixture is PlayerFixture => fixture !== null)
    .sort((a, b) => a.tournamentId - b.tournamentId || stageOrder(a.match.stage) - stageOrder(b.match.stage) || a.match.round - b.match.round);

  const stageRecords = (["GROUP", "SEMIFINAL", "FINAL", "TIEBREAK"] as MatchStage[])
    .map((stage) => buildStageRecord(stage, fixtures.filter((fixture) => fixture.match.stage === stage)))
    .filter((record) => record.played > 0);

  const opponentRecords = buildOpponentRecords(fixtures);
  const tournamentRecords = tournaments.map((tournament) =>
    buildTournamentRecord(player, tournament, states.find((state) => state.tournamentId === tournament.id) ?? null),
  );

  const matchWins = fixtures.filter((fixture) => fixture.won).length;
  const matchLosses = fixtures.length - matchWins;
  const roundsWon = fixtures.reduce((total, fixture) => total + fixture.roundsFor, 0);
  const roundsLost = fixtures.reduce((total, fixture) => total + fixture.roundsAgainst, 0);
  const streaks = calculateStreaks(fixtures);

  return {
    player,
    fixtures,
    tournaments: tournamentRecords,
    stageRecords,
    opponentRecords,
    tournamentPoints: tournamentRecords.reduce((sum, row) => sum + row.points, 0),
    titles: tournamentRecords.filter((row) => row.finish === "Winner").length,
    runnerUps: tournamentRecords.filter((row) => row.finish === "Runner-up").length,
    semifinals: tournamentRecords.filter((row) => row.finish === "Semifinal").length,
    tournamentsPlayed: tournamentRecords.filter((row) => row.played).length,
    matchWins,
    matchLosses,
    roundsWon,
    roundsLost,
    longestWinStreak: streaks.longest,
    currentWinStreak: streaks.current,
    winRate: fixtures.length === 0 ? 0 : Math.round((matchWins / fixtures.length) * 100),
    roundDifference: roundsWon - roundsLost,
    bestOpponent: opponentRecords.filter((row) => row.wins > 0).sort(compareBestOpponent)[0] ?? null,
    toughestOpponent: opponentRecords.filter((row) => row.losses > 0).sort(compareToughestOpponent)[0] ?? null,
  };
}

function buildTournamentRecord(player: Player, tournament: Tournament, state: CompetitionState | null): PlayerTournamentRecord {
  if (!state) return emptyTournamentRecord(tournament);
  const inTournament = [...state.groupAPlayers, ...state.groupBPlayers].some((entry) => entry.id === player.id);
  if (!inTournament) return emptyTournamentRecord(tournament);

  const fixtures = getCompletedMatches(state)
    .map((match) => toFixture(player, state.tournamentId, match))
    .filter((fixture): fixture is PlayerFixture => fixture !== null);

  let finish: PlayerTournamentRecord["finish"] = state.finalMatch?.completed ? "Group stage" : "In progress";
  let points = 0;

  if (state.finalMatch?.completed) {
    if (getMatchWinner(state.finalMatch).id === player.id) {
      finish = "Winner";
      points = 6;
    } else if (getMatchLoser(state.finalMatch).id === player.id) {
      finish = "Runner-up";
      points = 3;
    } else if (state.semifinals.some((match) => match.completed && getMatchLoser(match).id === player.id)) {
      finish = "Semifinal";
      points = 1;
    }
  }

  return {
    tournament,
    played: true,
    finish,
    points,
    matches: fixtures.length,
    wins: fixtures.filter((fixture) => fixture.won).length,
    losses: fixtures.filter((fixture) => !fixture.won).length,
    roundsFor: fixtures.reduce((sum, fixture) => sum + fixture.roundsFor, 0),
    roundsAgainst: fixtures.reduce((sum, fixture) => sum + fixture.roundsAgainst, 0),
  };
}

function emptyTournamentRecord(tournament: Tournament): PlayerTournamentRecord {
  return { tournament, played: false, finish: "Not played", points: 0, matches: 0, wins: 0, losses: 0, roundsFor: 0, roundsAgainst: 0 };
}

function toFixture(player: Player, tournamentId: number, match: Match): PlayerFixture | null {
  if (!match.completed || (match.player1.id !== player.id && match.player2.id !== player.id)) return null;
  const isPlayerOne = match.player1.id === player.id;
  const roundsFor = isPlayerOne ? match.player1Rounds : match.player2Rounds;
  const roundsAgainst = isPlayerOne ? match.player2Rounds : match.player1Rounds;
  return { tournamentId, match, opponent: isPlayerOne ? match.player2 : match.player1, won: roundsFor > roundsAgainst, roundsFor, roundsAgainst };
}

function getCompletedMatches(state: CompetitionState): Match[] {
  return [
    ...state.groupAFixtures.flatMap((round) => round.matches),
    ...state.groupBFixtures.flatMap((round) => round.matches),
    ...state.semifinals,
    ...(state.finalMatch ? [state.finalMatch] : []),
  ].filter((match) => match.completed);
}

function buildStageRecord(stage: MatchStage, fixtures: PlayerFixture[]): StageRecord {
  return {
    stage,
    played: fixtures.length,
    wins: fixtures.filter((fixture) => fixture.won).length,
    losses: fixtures.filter((fixture) => !fixture.won).length,
    roundsFor: fixtures.reduce((sum, fixture) => sum + fixture.roundsFor, 0),
    roundsAgainst: fixtures.reduce((sum, fixture) => sum + fixture.roundsAgainst, 0),
  };
}

function buildOpponentRecords(fixtures: PlayerFixture[]): OpponentRecord[] {
  const records = new Map<string, OpponentRecord>();
  for (const fixture of fixtures) {
    const row = records.get(fixture.opponent.id) ?? { opponent: fixture.opponent, played: 0, wins: 0, losses: 0, roundsFor: 0, roundsAgainst: 0 };
    row.played += 1;
    row.wins += fixture.won ? 1 : 0;
    row.losses += fixture.won ? 0 : 1;
    row.roundsFor += fixture.roundsFor;
    row.roundsAgainst += fixture.roundsAgainst;
    records.set(fixture.opponent.id, row);
  }
  return Array.from(records.values()).sort((a, b) => b.played - a.played || b.wins - a.wins || a.opponent.name.localeCompare(b.opponent.name));
}

function calculateStreaks(fixtures: PlayerFixture[]) {
  let longest = 0;
  let current = 0;
  for (const fixture of fixtures) {
    current = fixture.won ? current + 1 : 0;
    longest = Math.max(longest, current);
  }
  return { longest, current };
}

function compareBestOpponent(a: OpponentRecord, b: OpponentRecord) {
  return b.wins - a.wins || (b.roundsFor - b.roundsAgainst) - (a.roundsFor - a.roundsAgainst) || a.opponent.name.localeCompare(b.opponent.name);
}

function compareToughestOpponent(a: OpponentRecord, b: OpponentRecord) {
  return b.losses - a.losses || (b.roundsAgainst - b.roundsFor) - (a.roundsAgainst - a.roundsFor) || a.opponent.name.localeCompare(b.opponent.name);
}

function stageOrder(stage: MatchStage) {
  return stage === "GROUP" ? 1 : stage === "TIEBREAK" ? 2 : stage === "SEMIFINAL" ? 3 : 4;
}
