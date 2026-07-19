import type { FixtureRound } from "@/lib/competition/fixture";
import type { Match } from "@/types/competition";

export type TournamentTab = "A" | "B" | "BRACKET";

type TournamentTabsProps = {
  activeTab: TournamentTab;
  onChange: (tab: TournamentTab) => void;
  groupAFixtures: FixtureRound[];
  groupBFixtures: FixtureRound[];
  groupStageComplete: boolean;
  semifinals: Match[];
  finalMatch: Match | null;
};

export default function TournamentTabs({
  activeTab,
  onChange,
  groupAFixtures,
  groupBFixtures,
  groupStageComplete,
  semifinals,
  finalMatch,
}: TournamentTabsProps) {
  return (
    <div
      className="grid grid-cols-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-1"
      role="tablist"
      aria-label="Tournament stages"
    >
      <TournamentTabButton
        label="Group A"
        description={getGroupTabDescription(groupAFixtures)}
        active={activeTab === "A"}
        onClick={() => onChange("A")}
      />
      <TournamentTabButton
        label="Group B"
        description={getGroupTabDescription(groupBFixtures)}
        active={activeTab === "B"}
        onClick={() => onChange("B")}
      />
      <TournamentTabButton
        label="Bracket"
        description={getBracketTabDescription(
          groupStageComplete,
          semifinals,
          finalMatch,
        )}
        active={activeTab === "BRACKET"}
        disabled={!groupStageComplete}
        onClick={() => onChange("BRACKET")}
      />
    </div>
  );
}

type TournamentTabButtonProps = {
  label: string;
  description: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function TournamentTabButton({
  label,
  description,
  active,
  disabled = false,
  onClick,
}: TournamentTabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-xl px-3 py-4 text-left transition sm:px-4 ${
        active
          ? "bg-amber-400 text-zinc-950 shadow-lg shadow-amber-400/10"
          : disabled
            ? "cursor-not-allowed text-zinc-700"
            : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
      }`}
    >
      <span className="block text-xs font-black uppercase tracking-widest sm:text-sm">
        {label}
      </span>
      <span
        className={`mt-1 hidden text-xs sm:block ${
          active
            ? "text-zinc-800"
            : disabled
              ? "text-zinc-700"
              : "text-zinc-600"
        }`}
      >
        {description}
      </span>
    </button>
  );
}

function getGroupTabDescription(fixtures: FixtureRound[]) {
  const matches = fixtures.flatMap((round) => round.matches);
  const completedMatches = matches.filter((match) => match.completed).length;
  return `${completedMatches} of ${matches.length} matches`;
}

function getBracketTabDescription(
  groupStageComplete: boolean,
  semifinals: Match[],
  finalMatch: Match | null,
) {
  if (!groupStageComplete) return "Complete groups first";
  if (finalMatch?.completed) return "Tournament complete";
  if (finalMatch) return "Final ready";

  const completedSemifinals = semifinals.filter(
    (match) => match.completed,
  ).length;

  return `${completedSemifinals} of 2 semifinals`;
}
