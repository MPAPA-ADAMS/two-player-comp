-- CreateTable
CREATE TABLE "TournamentState" (
    "tournamentId" INTEGER NOT NULL,
    "state" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentState_pkey" PRIMARY KEY ("tournamentId")
);
