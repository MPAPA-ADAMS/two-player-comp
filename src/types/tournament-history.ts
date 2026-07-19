import type { MentorDraft } from "@/lib/competition/mentors";
import type {
  Match,
  Player,
  Tournament,
} from "@/types/competition";

export type HistoricalGroup = {
  players: Player[];
  matches: Match[];
};

export type TournamentHistory = {
  tournament: Tournament;
  groupA: HistoricalGroup;
  groupB: HistoricalGroup;
  semifinals: Match[];
  final: Match;
  mentorDraft?: MentorDraft | null;
};