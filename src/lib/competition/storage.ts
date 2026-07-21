
import type { CompetitionState } from "@/lib/competition/engine";
import { createMentorDraft } from "@/lib/competition/mentors";
import type { Tournament } from "@/types/competition";

const STORAGE_PREFIX = "tits-and-ass:competition";
const STORAGE_VERSION = 2;

export const COMPETITION_PROGRESS_EVENT =
  "competition-progress-changed";

type StoredCompetition = {
  version: number;
  savedAt: string;
  state: CompetitionState;
};

type DatabaseCompetition = {
  tournamentId: number;
  state: unknown;
  updatedAt?: string;
};

type DatabaseCompetitionResponse = {
  records: DatabaseCompetition[];
};

export function loadCompetitionState(
  tournamentId: Tournament["id"],
): CompetitionState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storageKey = getStorageKey(tournamentId);
    const rawValue =
      window.localStorage.getItem(storageKey);

    if (!rawValue) {
      return null;
    }

    const storedValue: unknown = JSON.parse(rawValue);

    if (
      !isStoredCompetition(
        storedValue,
        tournamentId,
      )
    ) {
      window.localStorage.removeItem(storageKey);

      return null;
    }

    return normalizeCompetitionState(
      storedValue.state,
      tournamentId,
    );
  } catch (error) {
    console.error(
      `Failed to load competition state for tournament ${tournamentId}.`,
      error,
    );

    return null;
  }
}

export function saveCompetitionState(
  state: CompetitionState,
): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  writeLocalState(
    state,
    new Date().toISOString(),
  );

  dispatchCompetitionProgressEvent();

  void fetch(
    `/api/competition/${state.tournamentId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({ state }),
    },
  )
    .then(async (response) => {
  if (response.ok) {
    return;
  }

  const errorBody = await response.text();

  console.error(
    `Database save failed for tournament ${state.tournamentId}.`,
    {
      status: response.status,
      statusText: response.statusText,
      body: errorBody,
    },
  );
})
    .catch((error: unknown) => {
      console.error(
        `Database save failed for tournament ${state.tournamentId}.`,
        error,
      );
    });

  return true;
}

export function clearCompetitionState(
  tournamentId: Tournament["id"],
): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  window.localStorage.removeItem(
    getStorageKey(tournamentId),
  );

  dispatchCompetitionProgressEvent();

  return true;
}

export function loadCompetitionStates(
  tournamentIds: Tournament["id"][],
): CompetitionState[] {
  return tournamentIds.flatMap(
    (tournamentId) => {
      const state =
        loadCompetitionState(tournamentId);

      return state ? [state] : [];
    },
  );
}

export async function syncCompetitionStatesFromDatabase(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const response = await fetch(
      "/api/competition",
      {
        cache: "no-store",
        credentials: "same-origin",
      },
    );

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`,
      );
    }

    const data =
      (await response.json()) as DatabaseCompetitionResponse;

    if (!Array.isArray(data.records)) {
      throw new Error(
        "Invalid response from /api/competition: records is not an array.",
      );
    }

    clearStoredCompetitionStates();

    for (const record of data.records) {
      const normalizedState =
        normalizeCompetitionState(
          record.state,
          record.tournamentId,
        );

      if (!normalizedState) {
        console.warn(
          `Ignoring invalid database state for tournament ${record.tournamentId}.`,
        );

        continue;
      }

      writeLocalState(
        normalizedState,
        record.updatedAt ??
          new Date().toISOString(),
      );
    }

    dispatchCompetitionProgressEvent();
  } catch (error) {
    console.error(
      "Could not synchronise competition data from PostgreSQL.",
      error,
    );
  }
}

function writeLocalState(
  state: CompetitionState,
  savedAt: string,
): void {
  const value: StoredCompetition = {
    version: STORAGE_VERSION,
    savedAt,
    state,
  };

  window.localStorage.setItem(
    getStorageKey(state.tournamentId),
    JSON.stringify(value),
  );
}

function clearStoredCompetitionStates(): void {
  const prefix =
    `${STORAGE_PREFIX}:v${STORAGE_VERSION}:tournament:`;

  const keysToRemove: string[] = [];

  for (
    let index = 0;
    index < window.localStorage.length;
    index += 1
  ) {
    const key =
      window.localStorage.key(index);

    if (key?.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }

  for (const key of keysToRemove) {
    window.localStorage.removeItem(key);
  }
}

function normalizeCompetitionState(
  value: unknown,
  expectedTournamentId?: number,
): CompetitionState | null {
  if (!isCompetitionState(value)) {
    return null;
  }

  if (
    expectedTournamentId !== undefined &&
    value.tournamentId !==
      expectedTournamentId
  ) {
    return null;
  }

  const groupsGenerated =
    value.groupAPlayers.length === 4 &&
    value.groupBPlayers.length === 4;

  if (
  !groupsGenerated ||
  value.mentorDraft ||
  value.mentorDraftSkipped === true
) {
  return value;
}

return {
  ...value,
  mentorDraft: createMentorDraft(value.tournamentId),
};
}

function isCompetitionState(
  value: unknown,
): value is CompetitionState {
  if (!isRecord(value)) {
    return false;
  }

  return (
  typeof value.tournamentId === "number" &&
  Array.isArray(value.groupAPlayers) &&
  Array.isArray(value.groupBPlayers) &&
  Array.isArray(value.groupAFixtures) &&
  Array.isArray(value.groupBFixtures) &&
  Array.isArray(value.semifinals) &&
  (value.finalMatch === null ||
    isRecord(value.finalMatch)) &&
  (
    value.mentorDraft === null ||
    value.mentorDraft === undefined ||
    isRecord(value.mentorDraft)
  ) &&
  (
    value.mentorDraftSkipped === undefined ||
    typeof value.mentorDraftSkipped === "boolean"
  )
);
}

function getStorageKey(
  tournamentId: Tournament["id"],
): string {
  return `${STORAGE_PREFIX}:v${STORAGE_VERSION}:tournament:${tournamentId}`;
}

function isStoredCompetition(
  value: unknown,
  tournamentId: Tournament["id"],
): value is StoredCompetition {
  if (
    !isRecord(value) ||
    value.version !== STORAGE_VERSION
  ) {
    return false;
  }

  const state = value.state;

  return (
    typeof value.savedAt === "string" &&
    isCompetitionState(state) &&
    state.tournamentId === tournamentId
  );
}

function dispatchCompetitionProgressEvent(): void {
  window.dispatchEvent(
    new Event(
      COMPETITION_PROGRESS_EVENT,
    ),
  );
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

