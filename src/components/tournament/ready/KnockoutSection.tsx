import type { Match, Player, Tournament } from "@/types/competition";
import StageLockedNotice from "./StageLockedNotice";

type KnockoutSectionProps = {
  semifinals: Match[];
  finalMatch: Match | null;
  bestOf: Tournament["bestOf"];
  semifinalsEditable: boolean;
  finalEditable: boolean;
  onSemifinalUpdate: (match: Match) => void;
  onFinalUpdate: (match: Match) => void;
};

export default function KnockoutSection({
  semifinals,
  finalMatch,
  bestOf,
  semifinalsEditable,
  finalEditable,
  onSemifinalUpdate,
  onFinalUpdate,
}: KnockoutSectionProps) {
  const semifinalOne = semifinals[0];
  const semifinalTwo = semifinals[1];

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800 px-5 py-5 sm:px-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-400">
            Knockout stage
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            Tournament bracket
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Group winners face the opposite group&apos;s runners-up. Semifinal
            winners advance to the championship match.
          </p>
        </div>

        <BracketStatus semifinals={semifinals} finalMatch={finalMatch} />
      </div>

      {!semifinalsEditable && (
        <div className="px-5 pt-5 sm:px-6">
          <StageLockedNotice>
            Semifinal results are locked because the final result has been
            entered.
          </StageLockedNotice>
        </div>
      )}

      {!finalEditable && (
        <div className="px-5 pt-5 sm:px-6">
          <StageLockedNotice>
            The final result is locked because the next tournament has been
            generated.
          </StageLockedNotice>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-[900px] p-6 lg:min-w-0 lg:p-8">
          <div className="grid grid-cols-[1fr_120px_1fr] items-center gap-0">
            <div>
              <BracketRoundHeader label="Semifinals" description="Final four" />

              <div className="mt-6 space-y-16">
                {semifinalOne && (
                  <BracketMatchCard
                    label="Semifinal 1"
                    match={semifinalOne}
                    bestOf={bestOf}
                    editable={semifinalsEditable}
                    onUpdate={onSemifinalUpdate}
                  />
                )}

                {semifinalTwo && (
                  <BracketMatchCard
                    label="Semifinal 2"
                    match={semifinalTwo}
                    bestOf={bestOf}
                    editable={semifinalsEditable}
                    onUpdate={onSemifinalUpdate}
                  />
                )}
              </div>
            </div>

            <BracketConnector />

            <div>
              <BracketRoundHeader
                label="Final"
                description="Championship match"
              />

              <div className="mt-6 flex min-h-[430px] items-center">
                {finalMatch ? (
                  <BracketMatchCard
                    label="Grand final"
                    match={finalMatch}
                    bestOf={bestOf}
                    editable={finalEditable}
                    onUpdate={onFinalUpdate}
                    featured
                  />
                ) : (
                  <PendingFinalCard />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type BracketMatchCardProps = {
  label: string;
  match: Match;
  bestOf: Tournament["bestOf"];
  editable: boolean;
  onUpdate: (match: Match) => void;
  featured?: boolean;
};

function BracketMatchCard({
  label,
  match,
  bestOf,
  editable,
  onUpdate,
  featured = false,
}: BracketMatchCardProps) {
  const winningScore = Math.ceil(bestOf / 2);
  const playerOneWon =
    match.completed && match.player1Rounds > match.player2Rounds;
  const playerTwoWon =
    match.completed && match.player2Rounds > match.player1Rounds;

  function updateScore(player: "player1" | "player2", score: number) {
    if (!editable) return;

    const nextPlayer1Rounds =
      player === "player1" ? score : match.player1Rounds;
    const nextPlayer2Rounds =
      player === "player2" ? score : match.player2Rounds;
    const completed =
      nextPlayer1Rounds === winningScore || nextPlayer2Rounds === winningScore;

    onUpdate({
      ...match,
      player1Rounds: nextPlayer1Rounds,
      player2Rounds: nextPlayer2Rounds,
      completed,
    });
  }

  return (
    <article
      className={`w-full rounded-2xl border p-4 transition sm:p-5 ${
        featured
          ? "border-amber-400/40 bg-gradient-to-br from-amber-400/10 via-zinc-950 to-zinc-950 shadow-xl shadow-amber-400/5"
          : "border-zinc-800 bg-zinc-950"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p
            className={`text-xs font-black uppercase tracking-[0.2em] ${
              featured ? "text-amber-400" : "text-zinc-500"
            }`}
          >
            {label}
          </p>
          <p className="mt-1 text-xs text-zinc-600">Best of {bestOf}</p>
        </div>

        <MatchStatusBadge completed={match.completed} editable={editable} />
      </div>

      <div className="space-y-3">
        <BracketPlayerRow
          player={match.player1}
          score={match.player1Rounds}
          maxScore={winningScore}
          winner={playerOneWon}
          disabled={!editable}
          onScoreChange={(score) => updateScore("player1", score)}
        />
        <BracketPlayerRow
          player={match.player2}
          score={match.player2Rounds}
          maxScore={winningScore}
          winner={playerTwoWon}
          disabled={!editable}
          onScoreChange={(score) => updateScore("player2", score)}
        />
      </div>

      {match.completed && (
        <div className="mt-4 border-t border-zinc-800 pt-4">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            {featured ? "Tournament winner" : "Winner advances"}
          </p>
        </div>
      )}
    </article>
  );
}

type BracketPlayerRowProps = {
  player: Player;
  score: number;
  maxScore: number;
  winner: boolean;
  disabled: boolean;
  onScoreChange: (score: number) => void;
};

function BracketPlayerRow({
  player,
  score,
  maxScore,
  winner,
  disabled,
  onScoreChange,
}: BracketPlayerRowProps) {
  return (
    <div
      className={`grid grid-cols-[1fr_auto] items-center gap-4 rounded-xl border px-4 py-3 ${
        winner
          ? "border-emerald-400/40 bg-emerald-400/10"
          : "border-zinc-800 bg-zinc-900"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`h-3 w-3 shrink-0 rounded-full ${
            winner
              ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-zinc-900"
              : ""
          }`}
          style={{ backgroundColor: player.colour }}
        />
        <div className="min-w-0">
          <p
            className={`truncate font-bold ${
              winner ? "text-white" : "text-zinc-300"
            }`}
          >
            {player.name}
          </p>
          {winner && (
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
              Winner
            </p>
          )}
        </div>
      </div>

      <select
        aria-label={`${player.name} rounds won`}
        value={score}
        disabled={disabled}
        onChange={(event) => onScoreChange(Number(event.target.value))}
        className="h-10 w-16 rounded-lg border border-zinc-700 bg-zinc-950 px-2 text-center font-black text-white outline-none transition focus:border-amber-400 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-500"
      >
        {Array.from({ length: maxScore + 1 }, (_, index) => (
          <option key={index} value={index}>
            {index}
          </option>
        ))}
      </select>
    </div>
  );
}

function MatchStatusBadge({
  completed,
  editable,
}: {
  completed: boolean;
  editable: boolean;
}) {
  const label = !editable
    ? "Locked"
    : completed
      ? "Complete · Editable"
      : "Awaiting result";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
        !editable
          ? "border-zinc-700 bg-zinc-900 text-zinc-500"
          : completed
            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
            : "border-zinc-700 bg-zinc-900 text-zinc-500"
      }`}
    >
      {label}
    </span>
  );
}

function BracketRoundHeader({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">
        {label}
      </p>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
    </div>
  );
}

function BracketConnector() {
  return (
    <div aria-hidden="true" className="relative h-[430px]">
      <div className="absolute left-0 top-[25%] h-px w-1/2 bg-zinc-700" />
      <div className="absolute left-0 top-[75%] h-px w-1/2 bg-zinc-700" />
      <div className="absolute left-1/2 top-[25%] h-1/2 w-px bg-zinc-700" />
      <div className="absolute left-1/2 top-1/2 h-px w-1/2 bg-zinc-700" />
      <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-400 bg-zinc-900" />
    </div>
  );
}

function PendingFinalCard() {
  return (
    <div className="w-full rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-xl text-zinc-500">
        ?
      </div>
      <p className="mt-4 font-black text-zinc-300">Final awaiting players</p>
      <p className="mt-2 text-sm text-zinc-500">
        Complete both semifinals to generate the championship match.
      </p>
    </div>
  );
}

function BracketStatus({
  semifinals,
  finalMatch,
}: {
  semifinals: Match[];
  finalMatch: Match | null;
}) {
  const completedSemifinals = semifinals.filter(
    (match) => match.completed,
  ).length;
  const tournamentComplete = finalMatch?.completed ?? false;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
        Progress
      </p>
      <p className="mt-1 font-black">
        {tournamentComplete
          ? "Tournament complete"
          : finalMatch
            ? "Final in progress"
            : `${completedSemifinals} of 2 semifinals`}
      </p>
    </div>
  );
}
