"use client";

import { useEffect } from "react";
import { syncCompetitionStatesFromDatabase } from "@/lib/competition/storage";

export default function CompetitionDatabaseSync() {
  useEffect(() => {
    void syncCompetitionStatesFromDatabase();
  }, []);

  return null;
}
