import { getMatchLoser, getMatchWinner } from "@/lib/competition/bracket";
import type { CompetitionState } from "@/lib/competition/engine";
import type { Match, Player } from "@/types/competition";

export type SeasonStandingRow = {
  position: number;
  player: Player;
  tournamentPoints: number;
  tournamentWins: number;
  runnerUpFinishes: number;
  semifinalFinishes: number;
  tournamentsPlayed: number;
  matchWins: number;
  matchLosses: number;
  roundsWon: number;
  roundsLost: number;
  roundDifference: number;
};

type MutableSeasonRow = Omit<SeasonStandingRow, "position" | "roundDifference">;

export function calculateSeasonStandings(
  states: CompetitionState[],
): SeasonStandingRow[] {
  const rows = new Map<Player["id"], MutableSeasonRow>();

  for (const state of states) {
    for (const player of getTournamentPlayers(state)) {
      ensurePlayer(rows, player);
    }

    for (const match of getCompletedMatches(state)) {
      applyMatchStatistics(rows, match);
    }

    applyTournamentPlacements(rows, state);
  }

  return Array.from(rows.values())
    .map((row) => ({
      ...row,
      position: 0,
      roundDifference: row.roundsWon - row.roundsLost,
    }))
    .sort(compareSeasonRows)
    .map((row, index) => ({
      ...row,
      position: index + 1,
    }));
}

export function getCompletedTournamentCount(
  states: CompetitionState[],
): number {
  return states.filter((state) => state.finalMatch?.completed).length;
}

function applyTournamentPlacements(
  rows: Map<Player["id"], MutableSeasonRow>,
  state: CompetitionState,
) {
  if (
    !state.finalMatch?.completed ||
    state.semifinals.length !== 2 ||
    !state.semifinals.every((match) => match.completed)
  ) {
    return;
  }

  const champion = getMatchWinner(state.finalMatch);
  const runnerUp = getMatchLoser(state.finalMatch);
  const semifinalists = state.semifinals.map((match) => getMatchLoser(match));

  const championRow = ensurePlayer(rows, champion);
  championRow.tournamentPoints += 6;
  championRow.tournamentWins += 1;
  championRow.tournamentsPlayed += 1;

  const runnerUpRow = ensurePlayer(rows, runnerUp);
  runnerUpRow.tournamentPoints += 3;
  runnerUpRow.runnerUpFinishes += 1;
  runnerUpRow.tournamentsPlayed += 1;

  for (const player of semifinalists) {
    const row = ensurePlayer(rows, player);
    row.tournamentPoints += 1;
    row.semifinalFinishes += 1;
    row.tournamentsPlayed += 1;
  }

  const placedIds = new Set([
    champion.id,
    runnerUp.id,
    ...semifinalists.map((player) => player.id),
  ]);

  for (const player of getTournamentPlayers(state)) {
    if (!placedIds.has(player.id)) {
      ensurePlayer(rows, player).tournamentsPlayed += 1;
    }
  }
}

function applyMatchStatistics(
  rows: Map<Player["id"], MutableSeasonRow>,
  match: Match,
) {
  const playerOne = ensurePlayer(rows, match.player1);
  const playerTwo = ensurePlayer(rows, match.player2);

  playerOne.roundsWon += match.player1Rounds;
  playerOne.roundsLost += match.player2Rounds;
  playerTwo.roundsWon += match.player2Rounds;
  playerTwo.roundsLost += match.player1Rounds;

  if (match.player1Rounds > match.player2Rounds) {
    playerOne.matchWins += 1;
    playerTwo.matchLosses += 1;
  } else if (match.player2Rounds > match.player1Rounds) {
    playerTwo.matchWins += 1;
    playerOne.matchLosses += 1;
  }
}

function getCompletedMatches(state: CompetitionState): Match[] {
  return [
    ...state.groupAFixtures.flatMap((round) => round.matches),
    ...state.groupBFixtures.flatMap((round) => round.matches),
    ...state.semifinals,
    ...(state.finalMatch ? [state.finalMatch] : []),
  ].filter((match) => match.completed);
}

function getTournamentPlayers(state: CompetitionState): Player[] {
  const players = new Map<Player["id"], Player>();

  for (const player of [...state.groupAPlayers, ...state.groupBPlayers]) {
    players.set(player.id, player);
  }

  return Array.from(players.values());
}

function ensurePlayer(
  rows: Map<Player["id"], MutableSeasonRow>,
  player: Player,
): MutableSeasonRow {
  const existing = rows.get(player.id);

  if (existing) {
    existing.player = player;
    return existing;
  }

  const row: MutableSeasonRow = {
    player,
    tournamentPoints: 0,
    tournamentWins: 0,
    runnerUpFinishes: 0,
    semifinalFinishes: 0,
    tournamentsPlayed: 0,
    matchWins: 0,
    matchLosses: 0,
    roundsWon: 0,
    roundsLost: 0,
  };

  rows.set(player.id, row);
  return row;
}

function compareSeasonRows(a: SeasonStandingRow, b: SeasonStandingRow) {
  return (
    b.tournamentPoints - a.tournamentPoints ||
    b.tournamentWins - a.tournamentWins ||
    b.matchWins - a.matchWins ||
    b.roundDifference - a.roundDifference ||
    b.roundsWon - a.roundsWon ||
    a.player.name.localeCompare(b.player.name)
  );
}

export type TournamentSummary = {
  tournamentId: import("@/types/competition").Tournament["id"];
  status: import("@/types/competition").Tournament["status"];
  champion: Player | null;
  runnerUp: Player | null;
};

export function getTournamentSummaries(
  states: CompetitionState[],
  tournamentIds: import("@/types/competition").Tournament["id"][],
): TournamentSummary[] {
  const statesById = new Map(states.map((state) => [state.tournamentId, state]));

  return tournamentIds.map((tournamentId) => {
    const state = statesById.get(tournamentId);

    if (!state) {
      return {
        tournamentId,
        status: "LOCKED",
        champion: null,
        runnerUp: null,
      };
    }

    if (state.finalMatch?.completed) {
      return {
        tournamentId,
        status: "COMPLETED",
        champion: getMatchWinner(state.finalMatch),
        runnerUp: getMatchLoser(state.finalMatch),
      };
    }

    const groupsGenerated =
      state.groupAPlayers.length === 4 && state.groupBPlayers.length === 4;

    return {
      tournamentId,
      status: groupsGenerated ? "IN_PROGRESS" : "READY",
      champion: null,
      runnerUp: null,
    };
  });
}
