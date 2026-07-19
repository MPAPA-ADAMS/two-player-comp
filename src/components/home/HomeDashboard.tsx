"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import GroupSection from "@/components/home/GroupSection";
import Hero from "@/components/home/Hero";
import LatestResults, { type LatestResult } from "@/components/home/LatestResults";
import MentorSpotlight from "@/components/home/MentorSpotlight";
import StandingsPreview from "@/components/home/StandingsPreview";
import SummaryCards from "@/components/home/SummaryCards";
import TournamentTimeline from "@/components/home/TournamentTimeline";
import type { CompetitionState } from "@/lib/competition/engine";
import {
  COMPETITION_PROGRESS_EVENT,
  getEffectiveTournamentStatuses,
} from "@/lib/competition/progression";
import { calculateMentorStandings } from "@/lib/competition/mentors";
import {
  calculateSeasonStandings,
  getCompletedTournamentCount,
} from "@/lib/competition/season";
import { loadCompetitionStates } from "@/lib/competition/storage";
import { players, tournaments } from "@/lib/mockData";
import type { Match, TournamentStatus } from "@/types/competition";

export default function HomeDashboard() {
  const [states, setStates] = useState<CompetitionState[]>([]);
  const [statuses, setStatuses] = useState<Map<number, TournamentStatus>>(new Map());
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    setStates(loadCompetitionStates(tournaments.map((tournament) => tournament.id)));
    setStatuses(getEffectiveTournamentStatuses(tournaments));
    setHydrated(true);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(COMPETITION_PROGRESS_EVENT, refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(COMPETITION_PROGRESS_EVENT, refresh);
    };
  }, [refresh]);

  const standings = useMemo(() => calculateSeasonStandings(states), [states]);
  const completedTournaments = useMemo(
    () => getCompletedTournamentCount(states),
    [states],
  );
  const mentorStandings = useMemo(() => calculateMentorStandings(states), [states]);

  const currentTournament = useMemo(() => {
    return (
      tournaments.find((tournament) => {
        const status = statuses.get(tournament.id) ?? tournament.status;
        return status === "READY" || status === "IN_PROGRESS";
      }) ?? tournaments[tournaments.length - 1]
    );
  }, [statuses]);

  const currentState = states.find(
    (state) => state.tournamentId === currentTournament.id,
  );

  const latestResults = useMemo(
    () => getLatestResults(states),
    [states],
  );

  if (!hydrated || standings.length === 0) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <Hero />
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-400">
            Loading current season data…
          </div>
        </div>
      </main>
    );
  }

  const leader = standings[0];
  const currentStatus = statuses.get(currentTournament.id) ?? currentTournament.status;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Hero />

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-10">
        <SummaryCards
          leader={leader}
          currentTournament={{ ...currentTournament, status: currentStatus }}
          completedTournaments={completedTournaments}
          totalTournaments={tournaments.length}
        />

        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <StandingsPreview standings={standings} />
          <LatestResults results={latestResults} />
        </section>

        {currentState &&
          currentState.groupAPlayers.length === 4 &&
          currentState.groupBPlayers.length === 4 && (
            <GroupSection
              tournament={{ ...currentTournament, status: currentStatus }}
              groupAPlayers={currentState.groupAPlayers}
              groupBPlayers={currentState.groupBPlayers}
            />
          )}

        <MentorSpotlight
          standings={mentorStandings}
          currentDraftPicks={currentState?.mentorDraft?.picks.length ?? 0}
          currentDraftComplete={currentState?.mentorDraft?.completed ?? false}
        />

        <TournamentTimeline tournaments={tournaments} statuses={statuses} />
      </div>
    </main>
  );
}

function getLatestResults(states: CompetitionState[]): LatestResult[] {
  return [...states]
    .sort((a, b) => b.tournamentId - a.tournamentId)
    .flatMap((state) => getCompletedMatches(state).reverse())
    .slice(0, 3)
    .map((match) => ({
      id: match.id,
      playerOne: match.player1.shortName,
      playerOneScore: match.player1Rounds,
      playerTwo: match.player2.shortName,
      playerTwoScore: match.player2Rounds,
    }));
}

function getCompletedMatches(state: CompetitionState): Match[] {
  return [
    ...state.groupAFixtures.flatMap((round) => round.matches),
    ...state.groupBFixtures.flatMap((round) => round.matches),
    ...state.semifinals,
    ...(state.finalMatch ? [state.finalMatch] : []),
  ].filter((match) => match.completed);
}
