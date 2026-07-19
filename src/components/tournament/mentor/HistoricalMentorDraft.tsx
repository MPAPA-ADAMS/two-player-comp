import { calculateMentorTournamentPoints, getMentorRoster, mentors, type MentorDraft } from "@/lib/competition/mentors";
import type { CompetitionState } from "@/lib/competition/engine";
import type { Match, Player } from "@/types/competition";

type Props = {
  draft: MentorDraft;
  players: Player[];
  semifinals: Match[];
  finalMatch: Match;
  tournamentId: number;
};

export default function HistoricalMentorDraft({ draft, players, semifinals, finalMatch, tournamentId }: Props) {
  const playerById = new Map(players.map((player) => [player.id, player]));
  const state = { tournamentId, groupAPlayers: [], groupBPlayers: [], groupAFixtures: [], groupBFixtures: [], semifinals, finalMatch, mentorDraft: draft } as CompetitionState;
  const points = calculateMentorTournamentPoints(state);

  return (
    <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-400">Mentor results</p>
      <h2 className="mt-2 text-2xl font-black">Draft performance</h2>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {[...mentors].sort((a, b) => (points.get(b.id) ?? 0) - (points.get(a.id) ?? 0)).map((mentor, index) => (
          <article key={mentor.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="flex items-center justify-between gap-4">
              <div><p className="text-xs font-black uppercase tracking-widest text-zinc-500">#{index + 1}</p><p className="mt-1 font-black">{mentor.name}</p></div>
              <p className="text-2xl font-black text-amber-400">{points.get(mentor.id) ?? 0} pts</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {getMentorRoster(draft, mentor.id).map((pick) => {
                const player = playerById.get(pick.playerId);
                return <span key={pick.playerId} className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs font-bold text-zinc-300">{player?.shortName ?? player?.name ?? "Unknown"}</span>;
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
