import type { CompetitionState } from "@/lib/competition/engine";
import { addMentorDraftPick, createMentorDraft } from "@/lib/competition/mentors";
import type { FixtureRound } from "@/lib/competition/fixture";
import type {
  Group,
  Match,
  Player,
  SeasonStanding,
  Tournament,
} from "@/types/competition";
import type { TournamentHistory } from "@/types/tournament-history";

export const players: Player[] = [
  { id: "player-1", name: "Mike Thompson", shortName: "Mike", colour: "#f59e0b" },
  { id: "player-2", name: "Alex Morgan", shortName: "Alex", colour: "#3b82f6" },
  { id: "player-3", name: "Tom Davies", shortName: "Tom", colour: "#22c55e" },
  { id: "player-4", name: "Ben Carter", shortName: "Ben", colour: "#ef4444" },
  { id: "player-5", name: "Jack Wilson", shortName: "Jack", colour: "#a855f7" },
  { id: "player-6", name: "Harry Cooper", shortName: "Harry", colour: "#06b6d4" },
  { id: "player-7", name: "Josh Taylor", shortName: "Josh", colour: "#ec4899" },
  { id: "player-8", name: "Sam Roberts", shortName: "Sam", colour: "#84cc16" },
];

const [mike, alex, tom, ben, jack, harry, josh, sam] = players;

export const tournaments: Tournament[] = [
  { id: 1, name: "Tournament 1", game: "Chess", bestOf: 3, status: "COMPLETED" },
  { id: 2, name: "Tournament 2", game: "Hive", bestOf: 3, status: "COMPLETED" },
  { id: 3, name: "Tournament 3", game: "Santorini", bestOf: 3, status: "COMPLETED" },
  { id: 4, name: "Tournament 4", game: "Patchwork", bestOf: 1, status: "READY" },
  { id: 5, name: "Tournament 5", game: "Onitama", bestOf: 3, status: "LOCKED" },
  { id: 6, name: "Tournament 6", game: "Jaipur", bestOf: 3, status: "LOCKED" },
  { id: 7, name: "Tournament 7", game: "7 Wonders Duel", bestOf: 1, status: "LOCKED" },
  { id: 8, name: "Tournament 8", game: "Tak", bestOf: 5, status: "LOCKED" },
];

type Score = readonly [number, number];
type GroupScores = readonly [Score, Score, Score, Score, Score, Score];

type CompletedTournamentDefinition = {
  tournamentId: 1 | 2 | 3;
  groupAPlayers: readonly [Player, Player, Player, Player];
  groupBPlayers: readonly [Player, Player, Player, Player];
  groupAScores: GroupScores;
  groupBScores: GroupScores;
  semifinalScores: readonly [Score, Score];
  finalScore: Score;
};

const completedDefinitions: CompletedTournamentDefinition[] = [
  {
    tournamentId: 1,
    groupAPlayers: [mike, tom, jack, josh],
    groupBPlayers: [alex, ben, harry, sam],
    groupAScores: [[2, 1], [2, 0], [2, 0], [2, 1], [2, 0], [2, 1]],
    groupBScores: [[2, 1], [2, 0], [2, 0], [2, 1], [2, 0], [2, 1]],
    semifinalScores: [[2, 0], [2, 1]],
    finalScore: [2, 1],
  },
  {
    tournamentId: 2,
    groupAPlayers: [alex, mike, harry, josh],
    groupBPlayers: [tom, jack, ben, sam],
    groupAScores: [[2, 1], [2, 0], [2, 0], [2, 1], [2, 0], [2, 1]],
    groupBScores: [[2, 1], [2, 0], [2, 0], [2, 1], [2, 0], [2, 1]],
    semifinalScores: [[2, 1], [2, 0]],
    finalScore: [2, 1],
  },
  {
    tournamentId: 3,
    groupAPlayers: [mike, tom, jack, josh],
    groupBPlayers: [alex, ben, harry, sam],
    groupAScores: [[1, 2], [2, 0], [2, 1], [2, 0], [2, 0], [2, 1]],
    groupBScores: [[2, 1], [2, 0], [2, 0], [2, 1], [2, 0], [2, 1]],
    semifinalScores: [[2, 1], [1, 2]],
    finalScore: [2, 1],
  },
];

const completedHistories = completedDefinitions.map(createCompletedTournament);

export const tournamentHistories: TournamentHistory[] = completedHistories.map(
  ({ history }) => history,
);

export const mockCompletedCompetitionStates: CompetitionState[] =
  completedHistories.map(({ state }) => state);

export function getTournamentHistory(
  tournamentId: Tournament["id"],
): TournamentHistory | null {
  return (
    tournamentHistories.find(
      (history) => history.tournament.id === tournamentId,
    ) ?? null
  );
}

export function getMockCompetitionState(
  tournamentId: Tournament["id"],
): CompetitionState | null {
  return (
    mockCompletedCompetitionStates.find(
      (state) => state.tournamentId === tournamentId,
    ) ?? null
  );
}

// Homepage preview only. Tournament 4 has not been drawn or saved yet.
export const groupAPlayers: Player[] = [mike, tom, jack, josh];
export const groupBPlayers: Player[] = [alex, ben, harry, sam];

// Backwards-compatible exports used by older screens.
const tournamentThreeHistory = getTournamentHistory(3)!;
export const tournamentThreeGroupAMatches = tournamentThreeHistory.groupA.matches;
export const tournamentThreeGroupBMatches = tournamentThreeHistory.groupB.matches;
export const tournamentThreeGroups: Group[] = [
  {
    name: "A",
    players: tournamentThreeHistory.groupA.players,
    matches: tournamentThreeHistory.groupA.matches,
  },
  {
    name: "B",
    players: tournamentThreeHistory.groupB.players,
    matches: tournamentThreeHistory.groupB.matches,
  },
];
export const tournamentThreeKnockoutMatches: Match[] = [
  ...tournamentThreeHistory.semifinals,
  tournamentThreeHistory.final,
];

export const seasonStandings: SeasonStanding[] = buildSeasonStandings(
  tournamentHistories,
);

function createCompletedTournament(definition: CompletedTournamentDefinition): {
  history: TournamentHistory;
  state: CompetitionState;
} {
  const tournament = tournaments.find(
    (item) => item.id === definition.tournamentId,
  );

  if (!tournament) {
    throw new Error(`Missing tournament ${definition.tournamentId}.`);
  }

  const groupAFixtures = createGroupFixtures(
    definition.tournamentId,
    "A",
    definition.groupAPlayers,
    definition.groupAScores,
  );
  const groupBFixtures = createGroupFixtures(
    definition.tournamentId,
    "B",
    definition.groupBPlayers,
    definition.groupBScores,
  );

  const groupAQualifiers = getTopTwo(definition.groupAPlayers, groupAFixtures);
  const groupBQualifiers = getTopTwo(definition.groupBPlayers, groupBFixtures);

  const semifinals: Match[] = [
    createMatch({
      id: `t${definition.tournamentId}-sf-1`,
      round: 1,
      stage: "SEMIFINAL",
      player1: groupAQualifiers[0],
      player2: groupBQualifiers[1],
      score: definition.semifinalScores[0],
    }),
    createMatch({
      id: `t${definition.tournamentId}-sf-2`,
      round: 1,
      stage: "SEMIFINAL",
      player1: groupBQualifiers[0],
      player2: groupAQualifiers[1],
      score: definition.semifinalScores[1],
    }),
  ];

  const finalistOne = getWinner(semifinals[0]);
  const finalistTwo = getWinner(semifinals[1]);
  const final = createMatch({
    id: `t${definition.tournamentId}-final`,
    round: 2,
    stage: "FINAL",
    player1: finalistOne,
    player2: finalistTwo,
    score: definition.finalScore,
  });

  let mentorDraft = createMentorDraft(definition.tournamentId);
  const draftPlayers = [...definition.groupAPlayers, ...definition.groupBPlayers];
  for (let index = 0; index < draftPlayers.length; index += 1) {
    mentorDraft = addMentorDraftPick(mentorDraft, draftPlayers[(index + definition.tournamentId - 1) % draftPlayers.length].id);
  }

  return {
    history: {
      tournament,
      groupA: {
        players: [...definition.groupAPlayers],
        matches: groupAFixtures.flatMap((round) => round.matches),
      },
      groupB: {
        players: [...definition.groupBPlayers],
        matches: groupBFixtures.flatMap((round) => round.matches),
      },
      semifinals,
      final,
      mentorDraft,
    },
    state: {
      tournamentId: definition.tournamentId,
      groupAPlayers: [...definition.groupAPlayers],
      groupBPlayers: [...definition.groupBPlayers],
      groupAFixtures,
      groupBFixtures,
      semifinals,
      finalMatch: final,
      mentorDraft,
    },
  };
}

function createGroupFixtures(
  tournamentId: number,
  group: "A" | "B",
  groupPlayers: readonly [Player, Player, Player, Player],
  scores: GroupScores,
): FixtureRound[] {
  const [player1, player2, player3, player4] = groupPlayers;
  const pairings: Array<readonly [Player, Player]> = [
    [player1, player2],
    [player3, player4],
    [player1, player3],
    [player2, player4],
    [player1, player4],
    [player2, player3],
  ];

  return [1, 2, 3].map((roundNumber) => ({
    number: roundNumber,
    matches: [0, 1].map((matchIndex) => {
      const index = (roundNumber - 1) * 2 + matchIndex;
      const [left, right] = pairings[index];
      return createMatch({
        id: `t${tournamentId}-${group.toLowerCase()}-r${roundNumber}-m${matchIndex + 1}`,
        round: roundNumber,
        stage: "GROUP",
        group,
        player1: left,
        player2: right,
        score: scores[index],
      });
    }),
  }));
}

function createMatch({
  id,
  round,
  stage,
  group,
  player1,
  player2,
  score,
}: {
  id: string;
  round: number;
  stage: Match["stage"];
  group?: "A" | "B";
  player1: Player;
  player2: Player;
  score: Score;
}): Match {
  return {
    id,
    round,
    stage,
    group,
    player1,
    player2,
    player1Rounds: score[0],
    player2Rounds: score[1],
    completed: true,
  };
}

function getTopTwo(
  groupPlayers: readonly Player[],
  fixtures: FixtureRound[],
): readonly [Player, Player] {
  const rows = groupPlayers
    .map((player) => {
      let wins = 0;
      let roundsWon = 0;
      let roundsLost = 0;

      for (const match of fixtures.flatMap((round) => round.matches)) {
        if (match.player1.id === player.id) {
          roundsWon += match.player1Rounds;
          roundsLost += match.player2Rounds;
          wins += match.player1Rounds > match.player2Rounds ? 1 : 0;
        } else if (match.player2.id === player.id) {
          roundsWon += match.player2Rounds;
          roundsLost += match.player1Rounds;
          wins += match.player2Rounds > match.player1Rounds ? 1 : 0;
        }
      }

      return { player, wins, roundsWon, roundDifference: roundsWon - roundsLost };
    })
    .sort(
      (a, b) =>
        b.wins - a.wins ||
        b.roundDifference - a.roundDifference ||
        b.roundsWon - a.roundsWon ||
        a.player.name.localeCompare(b.player.name),
    );

  return [rows[0].player, rows[1].player];
}

function getWinner(match: Match): Player {
  return match.player1Rounds > match.player2Rounds
    ? match.player1
    : match.player2;
}

function getLoser(match: Match): Player {
  return match.player1Rounds > match.player2Rounds
    ? match.player2
    : match.player1;
}

function buildSeasonStandings(
  histories: TournamentHistory[],
): SeasonStanding[] {
  return players.map((player) => {
    const tournamentPoints = tournaments.map((tournament) => {
      const history = histories.find(
        (item) => item.tournament.id === tournament.id,
      );
      if (!history) return 0;

      if (getWinner(history.final).id === player.id) return 6;
      if (getLoser(history.final).id === player.id) return 3;
      if (history.semifinals.some((match) => getLoser(match).id === player.id)) {
        return 1;
      }
      return 0;
    });

    return {
      player,
      tournamentPoints,
      tournamentWins: tournamentPoints.filter((points) => points === 6).length,
      runnerUpFinishes: tournamentPoints.filter((points) => points === 3).length,
      semifinalFinishes: tournamentPoints.filter((points) => points === 1).length,
    };
  });
}
