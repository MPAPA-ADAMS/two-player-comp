import type { CompetitionState } from "@/lib/competition/engine";
import { getMockCompetitionState } from "@/lib/mockData";
import { createMentorDraft } from "@/lib/competition/mentors";
import type { Tournament } from "@/types/competition";

const STORAGE_PREFIX = "tits-and-ass:competition";
const STORAGE_VERSION = 1;

type StoredCompetition = {
  version: number;
  savedAt: string;
  state: CompetitionState;
};

export function loadCompetitionState(
  tournamentId: Tournament["id"],
): CompetitionState | null {
  if (typeof window === "undefined") {
    return getMockCompetitionState(tournamentId);
  }

  try {
    const rawValue = window.localStorage.getItem(getStorageKey(tournamentId));

    if (!rawValue) {
      return getMockCompetitionState(tournamentId);
    }

    const storedValue: unknown = JSON.parse(rawValue);

    if (!isStoredCompetition(storedValue, tournamentId)) {
      window.localStorage.removeItem(getStorageKey(tournamentId));
      return getMockCompetitionState(tournamentId);
    }

    return normalizeCompetitionState(storedValue.state);
  } catch {
    return getMockCompetitionState(tournamentId);
  }
}

export function saveCompetitionState(state: CompetitionState): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const storedValue: StoredCompetition = {
    version: STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    state,
  };

  try {
    window.localStorage.setItem(
      getStorageKey(state.tournamentId),
      JSON.stringify(storedValue),
    );
    window.dispatchEvent(new Event("competition-progress-changed"));
    return true;
  } catch {
    return false;
  }
}

export function clearCompetitionState(
  tournamentId: Tournament["id"],
): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.localStorage.removeItem(getStorageKey(tournamentId));
    window.dispatchEvent(new Event("competition-progress-changed"));
    return true;
  } catch {
    return false;
  }
}

function normalizeCompetitionState(state: CompetitionState): CompetitionState {
  const groupsGenerated = state.groupAPlayers.length === 4 && state.groupBPlayers.length === 4;
  if (!groupsGenerated || state.mentorDraft) return state;
  return { ...state, mentorDraft: createMentorDraft(state.tournamentId) };
}

function getStorageKey(tournamentId: Tournament["id"]): string {
  return `${STORAGE_PREFIX}:v${STORAGE_VERSION}:tournament:${tournamentId}`;
}

function isStoredCompetition(
  value: unknown,
  tournamentId: Tournament["id"],
): value is StoredCompetition {
  if (!isRecord(value) || value.version !== STORAGE_VERSION) {
    return false;
  }

  const state = value.state;

  return (
    isRecord(state) &&
    state.tournamentId === tournamentId &&
    Array.isArray(state.groupAPlayers) &&
    Array.isArray(state.groupBPlayers) &&
    Array.isArray(state.groupAFixtures) &&
    Array.isArray(state.groupBFixtures) &&
    Array.isArray(state.semifinals) &&
    (state.finalMatch === null || isRecord(state.finalMatch))
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function loadCompetitionStates(
  tournamentIds: Tournament["id"][],
): CompetitionState[] {
  return tournamentIds.flatMap((tournamentId) => {
    const state = loadCompetitionState(tournamentId);
    return state ? [state] : [];
  });
}
