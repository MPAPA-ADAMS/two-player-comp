"use client";

import { useEffect, useMemo, useState } from "react";
import { getMatchLoser, getMatchWinner } from "@/lib/competition/bracket";
import type { CompetitionState } from "@/lib/competition/engine";
import {
  calculateMentorStandings,
  calculateMentorTournamentPoints,
  mentors,
} from "@/lib/competition/mentors";
import { COMPETITION_PROGRESS_EVENT } from "@/lib/competition/progression";
import { loadCompetitionStates } from "@/lib/competition/storage";
import type { Tournament } from "@/types/competition";

const TOURNAMENT_IDS = [1, 2, 3, 4, 5, 6, 7, 8] as Tournament["id"][];

type MentorDetail = {
  mentorId: string;
  tournamentsDrafted: number;
  championsDrafted: number;
  finalistsDrafted: number;
  semifinalistsDrafted: number;
  averagePoints: number;
  mvp: {
    playerId: string;
    playerName: string;
    points: number;
  } | null;
};

export default function MentorsPage() {
  const [states, setStates] = useState<CompetitionState[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setStates(loadCompetitionStates(TOURNAMENT_IDS));
      setHydrated(true);
    };

    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(COMPETITION_PROGRESS_EVENT, refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(COMPETITION_PROGRESS_EVENT, refresh);
    };
  }, []);

  const standings = useMemo(() => calculateMentorStandings(states), [states]);
  const details = useMemo(() => calculateMentorDetails(states), [states]);
  const completedDrafts = states.filter((state) => state.mentorDraft?.completed).length;
  const completedTournaments = states.filter(
    (state) => state.mentorDraft?.completed && state.finalMatch?.completed,
  ).length;
  const totalPoints = standings.reduce((total, row) => total + row.points, 0);
  const leader = standings[0];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-amber-400">
          Draft room
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Mentors</h1>
        <p className="mt-3 max-w-3xl leading-7 text-zinc-400">
          Mentors draft players after each group draw and score the same 6 / 3 / 1
          points earned by their champion, finalist, and semifinalist picks.
        </p>
      </header>

      {!hydrated ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-400">
          Loading mentor standings…
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Mentor leader"
              value={leader?.mentor.name ?? "—"}
              detail={leader ? `${leader.points} total points` : "No completed drafts"}
            />
            <SummaryCard
              label="Points awarded"
              value={totalPoints}
              detail="Across all completed mentor drafts"
            />
            <SummaryCard
              label="Drafts completed"
              value={completedDrafts}
              detail={`${completedTournaments} finished tournaments`}
            />
            <SummaryCard
              label="Best single draft"
              value={Math.max(0, ...standings.map((row) => row.bestDraft))}
              detail="Most points scored in one tournament"
            />
          </section>

          <section className="mt-8 grid gap-5 lg:grid-cols-3">
            {standings.map((row, index) => {
              const detail = details.find((item) => item.mentorId === row.mentor.id)!;

              return (
                <article
                  key={row.mentor.id}
                  className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
                >
                  <div className="border-b border-zinc-800 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                          Rank {index + 1}
                        </p>
                        <h2 className="mt-2 text-2xl font-black">{row.mentor.name}</h2>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-black text-amber-400">{row.points}</p>
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                          points
                        </p>
                      </div>
                    </div>
                  </div>

                  <dl className="grid grid-cols-2 gap-px bg-zinc-800">
                    <Stat label="Draft wins" value={row.tournamentWins} />
                    <Stat label="Best draft" value={`${row.bestDraft} pts`} />
                    <Stat
                      label="MVP"
                      value={detail.mvp ? `${detail.mvp.playerName} · ${detail.mvp.points} pts` : "—"}
                    />
                    <Stat label="Average" value={`${detail.averagePoints.toFixed(1)} pts`} />
                    <Stat label="Champions picked" value={detail.championsDrafted} />
                    <Stat label="Finalists picked" value={detail.finalistsDrafted} />
                    <Stat label="SF picks" value={detail.semifinalistsDrafted} />
                    <Stat label="Tournaments" value={detail.tournamentsDrafted} />
                  </dl>
                </article>
              );
            })}
          </section>

          <section className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
            <div className="border-b border-zinc-800 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Tournament breakdown
              </p>
              <h2 className="mt-2 text-2xl font-black">Mentor points by tournament</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-zinc-950 text-xs uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-5 py-3">Mentor</th>
                    {TOURNAMENT_IDS.map((id) => (
                      <th key={id} className="px-4 py-3 text-center">T{id}</th>
                    ))}
                    <th className="px-5 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row) => (
                    <tr key={row.mentor.id} className="border-t border-zinc-800">
                      <td className="px-5 py-4 font-black">{row.mentor.name}</td>
                      {TOURNAMENT_IDS.map((id) => {
                        const state = states.find((item) => item.tournamentId === id);
                        const score = state?.mentorDraft?.completed && state.finalMatch?.completed
                          ? calculateMentorTournamentPoints(state).get(row.mentor.id) ?? 0
                          : null;

                        return (
                          <td key={id} className="px-4 py-4 text-center font-bold text-zinc-300">
                            {score ?? "—"}
                          </td>
                        );
                      })}
                      <td className="px-5 py-4 text-right text-lg font-black text-amber-400">
                        {row.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function calculateMentorDetails(states: CompetitionState[]): MentorDetail[] {
  return mentors.map((mentor) => {
    let tournamentsDrafted = 0;
    let championsDrafted = 0;
    let finalistsDrafted = 0;
    let semifinalistsDrafted = 0;
    let points = 0;

    const playerNames = new Map<string, string>();
    const playerContributions = new Map<
      string,
      { points: number; wins: number; finals: number }
    >();

    for (const state of states) {
      for (const player of [...state.groupAPlayers, ...state.groupBPlayers]) {
        playerNames.set(player.id, player.name);
      }

      const draft = state.mentorDraft;
      if (!draft?.completed) continue;

      const picks = draft.picks.filter((pick) => pick.mentorId === mentor.id);
      tournamentsDrafted += 1;

      if (!state.finalMatch?.completed) continue;

      const pickedPlayerIds = new Set(picks.map((pick) => pick.playerId));
      const championId = getMatchWinner(state.finalMatch).id;
      const runnerUpId = getMatchLoser(state.finalMatch).id;
      const semifinalLoserIds = state.semifinals
        .filter((match) => match.completed)
        .map((match) => getMatchLoser(match).id);

      if (pickedPlayerIds.has(championId)) championsDrafted += 1;
      if (pickedPlayerIds.has(championId)) finalistsDrafted += 1;
      if (pickedPlayerIds.has(runnerUpId)) finalistsDrafted += 1;
      semifinalistsDrafted += semifinalLoserIds.filter((id) => pickedPlayerIds.has(id)).length;
      points += calculateMentorTournamentPoints(state).get(mentor.id) ?? 0;

      for (const pick of picks) {
        const contribution =
          pick.playerId === championId
            ? 6
            : pick.playerId === runnerUpId
              ? 3
              : semifinalLoserIds.includes(pick.playerId)
                ? 1
                : 0;

        const current = playerContributions.get(pick.playerId) ?? {
          points: 0,
          wins: 0,
          finals: 0,
        };

        playerContributions.set(pick.playerId, {
          points: current.points + contribution,
          wins: current.wins + (pick.playerId === championId ? 1 : 0),
          finals:
            current.finals +
            (pick.playerId === championId || pick.playerId === runnerUpId ? 1 : 0),
        });
      }
    }

    const mvpEntry = [...playerContributions.entries()].sort(([playerA, a], [playerB, b]) =>
      b.points - a.points ||
      b.wins - a.wins ||
      b.finals - a.finals ||
      (playerNames.get(playerA) ?? playerA).localeCompare(playerNames.get(playerB) ?? playerB),
    )[0];

    return {
      mentorId: mentor.id,
      tournamentsDrafted,
      championsDrafted,
      finalistsDrafted,
      semifinalistsDrafted,
      averagePoints: tournamentsDrafted === 0 ? 0 : points / tournamentsDrafted,
      mvp: mvpEntry
        ? {
            playerId: mvpEntry[0],
            playerName: playerNames.get(mvpEntry[0]) ?? mvpEntry[0],
            points: mvpEntry[1].points,
          }
        : null,
    };
  });
}

function SummaryCard({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</p>
      <p className="mt-3 truncate text-2xl font-black">{value}</p>
      <p className="mt-2 text-sm text-zinc-500">{detail}</p>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-zinc-900 p-4">
      <dt className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</dt>
      <dd className="mt-2 text-lg font-black text-zinc-100">{value}</dd>
    </div>
  );
}
