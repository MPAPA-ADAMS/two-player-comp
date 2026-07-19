"use client";

import { useMemo, useState } from "react";
import HistoricalMentorDraft from "@/components/tournament/mentor/HistoricalMentorDraft";
import TournamentNavigation from "@/components/tournament/TournamentNavigation";
import {
  calculateStandings,
  type StandingRow,
} from "@/lib/competition/standings";
import { getMatchLoser, getMatchWinner } from "@/lib/competition/bracket";
import type { Match, Player } from "@/types/competition";
import type { TournamentHistory } from "@/types/tournament-history";

type HistoryTab = "A" | "B" | "BRACKET";

type CompletedTournamentProps = {
  history: TournamentHistory;
};

export default function CompletedTournament({
  history,
}: CompletedTournamentProps) {
  const [activeTab, setActiveTab] = useState<HistoryTab>("BRACKET");

  const groupAStandings = useMemo(
    () =>
      calculateStandings(history.groupA.players, [
        {
          number: 1,
          matches: history.groupA.matches,
        },
      ]),
    [history.groupA],
  );

  const groupBStandings = useMemo(
    () =>
      calculateStandings(history.groupB.players, [
        {
          number: 1,
          matches: history.groupB.matches,
        },
      ]),
    [history.groupB],
  );

  const champion = getMatchWinner(history.final);

  const runnerUp = getMatchLoser(history.final);

  return (
    <section>
      <TournamentNavigation currentTournamentId={history.tournament.id} />

      <header className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-400">
              Tournament {history.tournament.id}
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              {history.tournament.game}
            </h1>

            <p className="mt-3 text-zinc-400">
              Best of {history.tournament.bestOf}
            </p>
          </div>

          <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
            Completed
          </span>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-400/15 via-zinc-900 to-zinc-900">
          <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-400">
                Tournament champion
              </p>

              <div className="mt-4 flex items-center gap-4">
                <PlayerMarker player={champion} size="large" />

                <div>
                  <h2 className="text-3xl font-black sm:text-4xl">
                    {champion.name}
                  </h2>

                  <p className="mt-1 text-zinc-400">
                    Defeated {runnerUp.name} {history.final.player1Rounds}–
                    {history.final.player2Rounds} in the final
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-400/30 bg-zinc-950/60 px-6 py-4 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                Season points
              </p>

              <p className="mt-1 text-3xl font-black text-amber-400">+6</p>
            </div>
          </div>
        </div>
      </header>

      <HistoryTabs activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === "A" && (
          <HistoricalGroupView
            group="A"
            standings={groupAStandings}
            matches={history.groupA.matches}
          />
        )}

        {activeTab === "B" && (
          <HistoricalGroupView
            group="B"
            standings={groupBStandings}
            matches={history.groupB.matches}
          />
        )}

        {activeTab === "BRACKET" && (
          <HistoricalBracket
            semifinals={history.semifinals}
            finalMatch={history.final}
          />
        )}
      </div>

      {history.mentorDraft?.completed && (
        <HistoricalMentorDraft
          draft={history.mentorDraft}
          players={[...history.groupA.players, ...history.groupB.players]}
          semifinals={history.semifinals}
          finalMatch={history.final}
          tournamentId={history.tournament.id}
        />
      )}
    </section>
  );
}

type HistoryTabsProps = {
  activeTab: HistoryTab;
  onChange: (tab: HistoryTab) => void;
};

function HistoryTabs({ activeTab, onChange }: HistoryTabsProps) {
  return (
    <div
      className="grid grid-cols-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-1"
      role="tablist"
      aria-label="Tournament history sections"
    >
      <HistoryTabButton
        label="Group A"
        description="Results and standings"
        active={activeTab === "A"}
        onClick={() => onChange("A")}
      />

      <HistoryTabButton
        label="Group B"
        description="Results and standings"
        active={activeTab === "B"}
        onClick={() => onChange("B")}
      />

      <HistoryTabButton
        label="Bracket"
        description="Semifinals and final"
        active={activeTab === "BRACKET"}
        onClick={() => onChange("BRACKET")}
      />
    </div>
  );
}

type HistoryTabButtonProps = {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
};

function HistoryTabButton({
  label,
  description,
  active,
  onClick,
}: HistoryTabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`rounded-xl px-3 py-4 text-left transition sm:px-4 ${
        active
          ? "bg-amber-400 text-zinc-950 shadow-lg shadow-amber-400/10"
          : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
      }`}
    >
      <span className="block text-xs font-black uppercase tracking-widest sm:text-sm">
        {label}
      </span>

      <span
        className={`mt-1 hidden text-xs sm:block ${
          active ? "text-zinc-800" : "text-zinc-600"
        }`}
      >
        {description}
      </span>
    </button>
  );
}

type HistoricalGroupViewProps = {
  group: "A" | "B";
  standings: StandingRow[];
  matches: Match[];
};

function HistoricalGroupView({
  group,
  standings,
  matches,
}: HistoricalGroupViewProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
      <div className="border-b border-zinc-800 pb-5">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-400">
          Group {group}
        </p>

        <h2 className="mt-2 text-2xl font-black">Final group results</h2>

        <p className="mt-2 text-sm text-zinc-400">
          This tournament is complete. Results are read-only.
        </p>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <HistoricalMatches matches={matches} />

        <HistoricalStandings standings={standings} />
      </div>
    </section>
  );
}

type HistoricalMatchesProps = {
  matches: Match[];
};

function HistoricalMatches({ matches }: HistoricalMatchesProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">
        Match results
      </p>

      <div className="mt-5 space-y-3">
        {matches.map((match) => (
          <ReadOnlyMatch key={match.id} match={match} />
        ))}
      </div>
    </section>
  );
}

type ReadOnlyMatchProps = {
  match: Match;
  featured?: boolean;
};

function ReadOnlyMatch({ match, featured = false }: ReadOnlyMatchProps) {
  const winner = getMatchWinner(match);

  return (
    <div
      className={`rounded-xl border p-4 ${
        featured
          ? "border-amber-400/30 bg-amber-400/5"
          : "border-zinc-800 bg-zinc-900"
      }`}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <ReadOnlyPlayer
          player={match.player1}
          score={match.player1Rounds}
          winner={winner.id === match.player1.id}
          align="right"
        />

        <span className="text-xs font-bold uppercase tracking-widest text-zinc-600">
          vs
        </span>

        <ReadOnlyPlayer
          player={match.player2}
          score={match.player2Rounds}
          winner={winner.id === match.player2.id}
          align="left"
        />
      </div>
    </div>
  );
}

type ReadOnlyPlayerProps = {
  player: Player;
  score: number;
  winner: boolean;
  align: "left" | "right";
};

function ReadOnlyPlayer({ player, score, winner, align }: ReadOnlyPlayerProps) {
  return (
    <div
      className={`flex items-center gap-3 ${
        align === "right"
          ? "justify-end text-right"
          : "flex-row-reverse justify-end text-left"
      }`}
    >
      <div>
        <p className={`font-bold ${winner ? "text-white" : "text-zinc-500"}`}>
          {player.name}
        </p>

        {winner && (
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Winner
          </p>
        )}
      </div>

      <span
        className={`inline-flex h-11 w-11 items-center justify-center rounded-lg text-lg font-black ${
          winner ? "bg-emerald-400 text-zinc-950" : "bg-zinc-950 text-zinc-500"
        }`}
      >
        {score}
      </span>
    </div>
  );
}

type HistoricalStandingsProps = {
  standings: StandingRow[];
};

function HistoricalStandings({ standings }: HistoricalStandingsProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 p-5">
        <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">
          Final table
        </p>

        <h3 className="mt-2 text-xl font-black">Standings</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="bg-zinc-900 text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3 text-left">Pos</th>

              <th className="px-4 py-3 text-left">Player</th>

              <th className="px-3 py-3 text-center">P</th>

              <th className="px-3 py-3 text-center">W</th>

              <th className="px-3 py-3 text-center">L</th>

              <th className="px-3 py-3 text-center">RD</th>
            </tr>
          </thead>

          <tbody>
            {standings.map((standing) => {
              const qualified = standing.position <= 2;

              return (
                <tr
                  key={standing.player.id}
                  className={`border-t border-zinc-800 ${
                    qualified ? "bg-emerald-400/5" : ""
                  }`}
                >
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full font-black ${
                        qualified
                          ? "bg-emerald-400 text-zinc-950"
                          : "bg-zinc-900 text-zinc-400"
                      }`}
                    >
                      {standing.position}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <PlayerMarker player={standing.player} />

                      <span className="font-bold">{standing.player.name}</span>
                    </div>
                  </td>

                  <td className="px-3 py-4 text-center">{standing.played}</td>

                  <td className="px-3 py-4 text-center">{standing.wins}</td>

                  <td className="px-3 py-4 text-center">{standing.losses}</td>

                  <td className="px-3 py-4 text-center font-bold">
                    {formatDifference(standing.roundDifference)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-zinc-800 px-5 py-4 text-xs text-zinc-500">
        Positions one and two qualified for the semifinals.
      </div>
    </section>
  );
}

type HistoricalBracketProps = {
  semifinals: Match[];
  finalMatch: Match;
};

function HistoricalBracket({ semifinals, finalMatch }: HistoricalBracketProps) {
  const champion = getMatchWinner(finalMatch);

  const runnerUp = getMatchLoser(finalMatch);

  const losingSemifinalists = semifinals.map((match) => getMatchLoser(match));

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
      <div className="border-b border-zinc-800 pb-5">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-400">
          Knockout stage
        </p>

        <h2 className="mt-2 text-3xl font-black">Final bracket</h2>
      </div>

      <div className="mt-6 grid gap-8 xl:grid-cols-[1fr_0.8fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            Semifinals
          </p>

          <div className="mt-4 space-y-4">
            {semifinals.map((match, index) => (
              <div key={match.id}>
                <p className="mb-2 text-sm font-bold text-zinc-400">
                  Semifinal {index + 1}
                </p>

                <ReadOnlyMatch match={match} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Final
          </p>

          <div className="mt-4">
            <ReadOnlyMatch match={finalMatch} featured />
          </div>

          <div className="mt-6 grid gap-3">
            <PlacementRow label="Champion" player={champion} points={6} />

            <PlacementRow label="Runner-up" player={runnerUp} points={3} />

            {losingSemifinalists.map((player) => (
              <PlacementRow
                key={player.id}
                label="Semifinalist"
                player={player}
                points={1}
              />
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}

type PlacementRowProps = {
  label: string;
  player: Player;
  points: number;
};

function PlacementRow({ label, player, points }: PlacementRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
      <div className="flex items-center gap-3">
        <PlayerMarker player={player} />

        <div>
          <p className="font-bold">{player.name}</p>

          <p className="text-xs uppercase tracking-widest text-zinc-500">
            {label}
          </p>
        </div>
      </div>

      <span className="font-black text-amber-400">+{points}</span>
    </div>
  );
}

type PlayerMarkerProps = {
  player: Player;
  size?: "small" | "large";
};

function PlayerMarker({ player, size = "small" }: PlayerMarkerProps) {
  return (
    <span
      className={`shrink-0 rounded-full ${
        size === "large" ? "h-14 w-14 border-4 border-amber-400" : "h-3 w-3"
      }`}
      style={{
        backgroundColor: player.colour,
      }}
    />
  );
}

function formatDifference(difference: number) {
  return difference > 0 ? `+${difference}` : difference;
}
