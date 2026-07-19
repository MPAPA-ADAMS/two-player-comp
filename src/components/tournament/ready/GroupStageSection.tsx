import PlayerLink from "@/components/players/PlayerLink";
import type { FixtureRound } from "@/lib/competition/fixture";
import type { StandingRow } from "@/lib/competition/standings";
import type { Match, Player, Tournament } from "@/types/competition";
import StageLockedNotice from "./StageLockedNotice";

type GroupName = "A" | "B";

type GroupStageSectionProps = {
  activeGroup: GroupName;
  activeFixtures: FixtureRound[];
  activeStandings: StandingRow[];
  activePlayers: Player[];
  bestOf: Tournament["bestOf"];
  editable: boolean;
  onMatchUpdate: (group: GroupName, match: Match) => void;
};

export default function GroupStageSection({
  activeGroup,
  activeFixtures,
  activeStandings,
  activePlayers,
  bestOf,
  editable,
  onMatchUpdate,
}: GroupStageSectionProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-400">
            Group {activeGroup}
          </p>
          <h2 className="mt-2 text-2xl font-black">Fixtures and standings</h2>
        </div>
        <GroupProgress fixtures={activeFixtures} />
      </div>

      {!editable && (
        <StageLockedNotice>
          Group results are locked because a semifinal result has already been
          entered.
        </StageLockedNotice>
      )}

      <GroupPlayerStrip players={activePlayers} />

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <FixtureList
          group={activeGroup}
          rounds={activeFixtures}
          bestOf={bestOf}
          editable={editable}
          onMatchUpdate={onMatchUpdate}
        />
        <StandingsTable standings={activeStandings} />
      </div>
    </section>
  );
}

type FixtureListProps = {
  group: GroupName;
  rounds: FixtureRound[];
  bestOf: Tournament["bestOf"];
  editable: boolean;
  onMatchUpdate: (group: GroupName, match: Match) => void;
};

function FixtureList({
  group,
  rounds,
  bestOf,
  editable,
  onMatchUpdate,
}: FixtureListProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">
        Schedule
      </p>
      <h3 className="mt-2 text-xl font-black">Group {group} fixtures</h3>

      <div className="mt-6 space-y-6">
        {rounds.map((round) => (
          <div key={round.number}>
            <div className="flex items-center gap-3">
              <p className="text-sm font-bold uppercase tracking-widest text-amber-400">
                Round {round.number}
              </p>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>

            <div className="mt-3 space-y-3">
              {round.matches.map((match) => (
                <MatchResultCard
                  key={match.id}
                  match={match}
                  group={group}
                  bestOf={bestOf}
                  editable={editable}
                  onMatchUpdate={onMatchUpdate}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

type MatchResultCardProps = {
  match: Match;
  group: GroupName;
  bestOf: Tournament["bestOf"];
  editable: boolean;
  onMatchUpdate: (group: GroupName, match: Match) => void;
};

function MatchResultCard({
  match,
  group,
  bestOf,
  editable,
  onMatchUpdate,
}: MatchResultCardProps) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        match.completed
          ? "border-emerald-400/30 bg-emerald-400/5"
          : "border-zinc-800 bg-zinc-900"
      }`}
    >
      <EditableMatch
        match={match}
        bestOf={bestOf}
        editable={editable}
        onMatchUpdate={(updatedMatch) => onMatchUpdate(group, updatedMatch)}
      />
    </div>
  );
}

type EditableMatchProps = {
  match: Match;
  bestOf: Tournament["bestOf"];
  editable: boolean;
  onMatchUpdate: (match: Match) => void;
};

function EditableMatch({
  match,
  bestOf,
  editable,
  onMatchUpdate,
}: EditableMatchProps) {
  const roundsToWin = Math.ceil(bestOf / 2);

  function updateScore(
    field: "player1Rounds" | "player2Rounds",
    value: number,
  ) {
    if (!editable) return;

    const safeValue = Number.isNaN(value)
      ? 0
      : Math.max(0, Math.min(roundsToWin, value));

    onMatchUpdate({
      ...match,
      [field]: safeValue,
      completed: false,
    });
  }

  function saveResult() {
    if (!editable) return;

    const player1Won =
      match.player1Rounds === roundsToWin &&
      match.player1Rounds > match.player2Rounds;
    const player2Won =
      match.player2Rounds === roundsToWin &&
      match.player2Rounds > match.player1Rounds;

    if (!player1Won && !player2Won) {
      window.alert(`A player must reach ${roundsToWin} rounds to win this match.`);
      return;
    }

    onMatchUpdate({ ...match, completed: true });
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <PlayerScoreInput
          player={match.player1}
          value={match.player1Rounds}
          maximum={roundsToWin}
          align="right"
          disabled={!editable}
          onChange={(value) => updateScore("player1Rounds", value)}
        />
        <span className="text-center text-sm font-bold text-zinc-600">VS</span>
        <PlayerScoreInput
          player={match.player2}
          value={match.player2Rounds}
          maximum={roundsToWin}
          align="left"
          disabled={!editable}
          onChange={(value) => updateScore("player2Rounds", value)}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-zinc-800 pt-4">
        <span
          className={
            !editable
              ? "text-sm text-zinc-600"
              : match.completed
                ? "text-sm font-semibold text-emerald-400"
                : "text-sm text-zinc-500"
          }
        >
          {!editable
            ? "Result locked"
            : match.completed
              ? "Result saved"
              : `First to ${roundsToWin}`}
        </span>

        <button
          type="button"
          disabled={!editable}
          onClick={saveResult}
          className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-zinc-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600"
        >
          {match.completed ? "Update result" : "Save result"}
        </button>
      </div>
    </>
  );
}

type PlayerScoreInputProps = {
  player: Player;
  value: number;
  maximum: number;
  align: "left" | "right";
  disabled: boolean;
  onChange: (value: number) => void;
};

function PlayerScoreInput({
  player,
  value,
  maximum,
  align,
  disabled,
  onChange,
}: PlayerScoreInputProps) {
  return (
    <div
      className={`flex items-center gap-3 ${
        align === "right" ? "justify-end" : "justify-start sm:flex-row-reverse"
      }`}
    >
      <div className={align === "right" ? "text-right" : "text-left"}>
        <p className="font-bold"><PlayerLink player={player}>{player.name}</PlayerLink></p>
        <p className="text-sm text-zinc-500">{player.shortName}</p>
      </div>

      <input
        type="number"
        min={0}
        max={maximum}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-12 w-16 rounded-lg border border-zinc-700 bg-zinc-950 text-center text-xl font-black outline-none transition focus:border-amber-400 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-600"
      />
    </div>
  );
}

type GroupPlayerStripProps = { players: Player[] };

function GroupPlayerStrip({ players }: GroupPlayerStripProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {players.map((player) => (
        <div
          key={player.id}
          className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3"
        >
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: player.colour }}
          />
          <div className="min-w-0">
            <p className="truncate font-bold"><PlayerLink player={player}>{player.name}</PlayerLink></p>
            <p className="text-xs text-zinc-500">{player.shortName}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

type GroupProgressProps = { fixtures: FixtureRound[] };

function GroupProgress({ fixtures }: GroupProgressProps) {
  const matches = fixtures.flatMap((round) => round.matches);
  const completedMatches = matches.filter((match) => match.completed).length;
  const percentage =
    matches.length === 0
      ? 0
      : Math.round((completedMatches / matches.length) * 100);

  return (
    <div className="min-w-44 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
          Progress
        </p>
        <p className="text-sm font-black">
          {completedMatches}/{matches.length}
        </p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-amber-400 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

type StandingsTableProps = { standings: StandingRow[] };

function StandingsTable({ standings }: StandingsTableProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 p-5">
        <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">
          Live table
        </p>
        <h3 className="mt-2 text-xl font-black">Standings</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-zinc-900 text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3 text-left">Pos</th>
              <th className="px-4 py-3 text-left">Player</th>
              <th className="px-3 py-3 text-center">P</th>
              <th className="px-3 py-3 text-center">W</th>
              <th className="px-3 py-3 text-center">L</th>
              <th className="px-3 py-3 text-center">RW</th>
              <th className="px-3 py-3 text-center">RD</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing) => {
              const qualifying = standing.position <= 2;
              return (
                <tr
                  key={standing.player.id}
                  className={`border-t border-zinc-800 ${
                    qualifying ? "bg-emerald-400/5" : ""
                  }`}
                >
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full font-black ${
                        qualifying
                          ? "bg-emerald-400 text-zinc-950"
                          : "bg-zinc-900 text-zinc-400"
                      }`}
                    >
                      {standing.position}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: standing.player.colour }}
                      />
                      <PlayerLink player={standing.player} className="font-bold hover:text-amber-300 hover:underline">{standing.player.name}</PlayerLink>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-center">{standing.played}</td>
                  <td className="px-3 py-4 text-center">{standing.wins}</td>
                  <td className="px-3 py-4 text-center">{standing.losses}</td>
                  <td className="px-3 py-4 text-center">{standing.roundsWon}</td>
                  <td className="px-3 py-4 text-center font-bold">
                    {standing.roundDifference > 0
                      ? `+${standing.roundDifference}`
                      : standing.roundDifference}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-zinc-800 px-5 py-4 text-xs text-zinc-500">
        The top two players qualify for the semifinals.
      </div>
    </section>
  );
}
