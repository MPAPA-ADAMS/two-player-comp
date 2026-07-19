"use client";

import { getMentorRoster, mentors, type MentorDraft } from "@/lib/competition/mentors";
import type { Player } from "@/types/competition";

type Props = {
  draft: MentorDraft;
  players: Player[];
  groupAPlayerIds: string[];
  onPick: (playerId: string) => void;
  editable?: boolean;
};

export default function MentorDraftSection({ draft, players, groupAPlayerIds, onPick, editable = false }: Props) {
  const playerById = new Map(players.map((player) => [player.id, player]));
  const drafted = new Set(draft.picks.map((pick) => pick.playerId));
  const activeMentorId = draft.pickOrder[draft.picks.length];
  const activeMentor = mentors.find((mentor) => mentor.id === activeMentorId);

  return (
    <section className="rounded-2xl border border-amber-400/30 bg-zinc-900 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-400">Mentor draft</p>
          <h2 className="mt-2 text-2xl font-black">
            {draft.completed ? "Draft complete" : `${activeMentor?.name ?? "Mentor"} is on the clock`}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            {draft.completed
              ? "All players have been assigned. Group matches are now unlocked."
              : `Pick ${draft.picks.length + 1} of ${draft.pickOrder.length}. Select one available player.`}
          </p>
        </div>
        <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-black uppercase tracking-widest text-zinc-300">
          {draft.picks.length}/{draft.pickOrder.length} picks
        </span>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {mentors.map((mentor) => {
          const roster = getMentorRoster(draft, mentor.id);
          return (
            <article key={mentor.id} className={`rounded-xl border p-4 ${mentor.id === activeMentorId && !draft.completed ? "border-amber-400 bg-amber-400/5" : "border-zinc-800 bg-zinc-950"}`}>
              <p className="font-black">{mentor.name}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-zinc-500">{roster.length} drafted</p>
              <div className="mt-4 space-y-2">
                {roster.length === 0 ? <p className="text-sm text-zinc-600">No picks yet</p> : roster.map((pick) => {
                  const player = playerById.get(pick.playerId);
                  return player ? <div key={pick.playerId} className="flex items-center justify-between rounded-lg bg-zinc-900 px-3 py-2 text-sm"><span className="font-bold">{player.shortName || player.name}</span><span className="text-xs text-zinc-500">#{pick.pickNumber}</span></div> : null;
                })}
              </div>
            </article>
          );
        })}
      </div>

      {!draft.completed && editable && (
        <div className="mt-6">
          <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Available players</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {players.filter((player) => !drafted.has(player.id)).map((player) => (
              <button key={player.id} type="button" onClick={() => onPick(player.id)} className="rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-left transition hover:border-amber-400 hover:bg-zinc-900">
                <span className="block font-black">{player.name}</span>
                <span className="mt-1 block text-xs font-bold uppercase tracking-widest text-zinc-500">Group {groupAPlayerIds.includes(player.id) ? "A" : "B"}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {!draft.completed && !editable && (
        <p className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
          The mentor draft is currently being managed by an administrator.
        </p>
      )}
    </section>
  );
}
