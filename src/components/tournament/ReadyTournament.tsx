"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import GroupDraw from "@/components/tournament/GroupDraw";
import MentorDraftSection from "@/components/tournament/mentor/MentorDraftSection";
import TournamentNavigation from "@/components/tournament/TournamentNavigation";
import GeneratedGroupsOverview from "@/components/tournament/ready/GeneratedGroupsOverview";
import GroupStageSection from "@/components/tournament/ready/GroupStageSection";
import KnockoutSection from "@/components/tournament/ready/KnockoutSection";
import TournamentHeader from "@/components/tournament/ready/TournamentHeader";
import TournamentResult from "@/components/tournament/ready/TournamentResult";
import TournamentTabs, {
  type TournamentTab,
} from "@/components/tournament/ready/TournamentTabs";
import type { GeneratedGroups } from "@/lib/competition/draw";
import {
  competitionReducer,
  createCompetitionState,
  getCompetitionView,
  type GroupName,
} from "@/lib/competition/engine";
import {
  clearCompetitionState,
  loadCompetitionState,
  saveCompetitionState,
} from "@/lib/competition/storage";
import type { Match, Player, Tournament } from "@/types/competition";

type ReadyTournamentProps = {
  tournament: Tournament;
  players: Player[];
  nextTournamentGenerated?: boolean;
};

export default function ReadyTournament({
  tournament,
  players,
  nextTournamentGenerated = false,
}: ReadyTournamentProps) {
  const [activeTab, setActiveTab] = useState<TournamentTab>("A");
  const [hydrated, setHydrated] = useState(false);
  const [competition, dispatch] = useReducer(
    competitionReducer,
    tournament.id,
    createCompetitionState,
  );

  useEffect(() => {
    setHydrated(false);

    const storedState = loadCompetitionState(tournament.id);

    dispatch({
      type: "HYDRATE",
      state: storedState ?? createCompetitionState(tournament.id),
    });
    setActiveTab("A");
    setHydrated(true);
  }, [tournament.id]);

  useEffect(() => {
    if (!hydrated || competition.tournamentId !== tournament.id) {
      return;
    }

    saveCompetitionState(competition);
  }, [competition, hydrated, tournament.id]);

  const view = useMemo(
    () => getCompetitionView(competition, nextTournamentGenerated),
    [competition, nextTournamentGenerated],
  );

  function handleDrawComplete(groups: GeneratedGroups) {
    dispatch({ type: "DRAW_COMPLETED", groups });
    setActiveTab("A");
  }

  function handleMentorPick(playerId: Player["id"]) {
    dispatch({ type: "MENTOR_PLAYER_DRAFTED", playerId });
  }

  function handleGroupMatchUpdate(group: GroupName, match: Match) {
    dispatch({ type: "GROUP_RESULT_RECORDED", group, match });
  }

  function handleSemifinalUpdate(match: Match) {
    dispatch({ type: "SEMIFINAL_RESULT_RECORDED", match });
  }

  function handleFinalUpdate(match: Match) {
    dispatch({
      type: "FINAL_RESULT_RECORDED",
      match,
      nextTournamentGenerated,
    });
  }

  function handleReset() {
    const confirmed = window.confirm(
      "Reset this tournament? The draw and every saved result for this tournament will be permanently removed from this browser.",
    );

    if (!confirmed) {
      return;
    }

    clearCompetitionState(tournament.id);
    dispatch({ type: "RESET", tournamentId: tournament.id });
    setActiveTab("A");
  }

  const activeGroup: GroupName = activeTab === "B" ? "B" : "A";
  const activeFixtures =
    activeGroup === "A"
      ? competition.groupAFixtures
      : competition.groupBFixtures;
  const activeStandings =
    activeGroup === "A" ? view.groupAStandings : view.groupBStandings;
  const activePlayers =
    activeGroup === "A" ? competition.groupAPlayers : competition.groupBPlayers;

  const displayedStatus: Tournament["status"] = view.tournamentComplete
    ? "COMPLETED"
    : view.groupsGenerated
      ? "IN_PROGRESS"
      : tournament.status;

  return (
    <section>
      <TournamentNavigation currentTournamentId={tournament.id} />

      <TournamentHeader
        tournament={tournament}
        status={displayedStatus}
        groupsGenerated={view.groupsGenerated}
        groupStageComplete={view.groupStageComplete}
        tournamentComplete={view.tournamentComplete}
        onReset={handleReset}
      />

      {!hydrated ? (
        <TournamentLoadingState />
      ) : !view.groupsGenerated ? (
        <GroupDraw players={players} onComplete={handleDrawComplete} />
      ) : (
        <GeneratedGroupsOverview
          groupAStandings={view.groupAStandings}
          groupBStandings={view.groupBStandings}
          groupAComplete={view.groupAComplete}
          groupBComplete={view.groupBComplete}
        />
      )}


      {hydrated && view.groupsGenerated && (
        <div className="mt-8 space-y-6">
          {competition.mentorDraft && (
            <MentorDraftSection
              draft={competition.mentorDraft}
              players={[...competition.groupAPlayers, ...competition.groupBPlayers]}
              groupAPlayerIds={competition.groupAPlayers.map((player) => player.id)}
              onPick={handleMentorPick}
            />
          )}

          {!view.mentorDraftComplete && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-sm text-zinc-400">
              Complete the mentor draft to unlock group-stage results.
            </div>
          )}

          <TournamentTabs
            activeTab={activeTab}
            onChange={setActiveTab}
            groupAFixtures={competition.groupAFixtures}
            groupBFixtures={competition.groupBFixtures}
            groupStageComplete={view.groupStageComplete}
            semifinals={competition.semifinals}
            finalMatch={competition.finalMatch}
          />

          {activeTab !== "BRACKET" && (
            <GroupStageSection
              activeGroup={activeGroup}
              activeFixtures={activeFixtures}
              activeStandings={activeStandings}
              activePlayers={activePlayers}
              bestOf={tournament.bestOf}
              editable={view.groupMatchesEditable}
              onMatchUpdate={handleGroupMatchUpdate}
            />
          )}

          {activeTab === "BRACKET" && view.groupStageComplete && (
            <>
              <KnockoutSection
                semifinals={competition.semifinals}
                finalMatch={competition.finalMatch}
                bestOf={tournament.bestOf}
                semifinalsEditable={view.semifinalsEditable}
                finalEditable={view.finalEditable}
                onSemifinalUpdate={handleSemifinalUpdate}
                onFinalUpdate={handleFinalUpdate}
              />

              {view.tournamentComplete && competition.finalMatch && (
                <TournamentResult
                  finalMatch={competition.finalMatch}
                  semifinals={competition.semifinals}
                />
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}

function TournamentLoadingState() {
  return (
    <div
      role="status"
      className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center"
    >
      <p className="text-sm font-bold uppercase tracking-widest text-amber-400">
        Restoring tournament
      </p>
      <p className="mt-3 text-zinc-400">Loading the latest saved results…</p>
    </div>
  );
}
