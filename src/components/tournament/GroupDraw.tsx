"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { generateGroups, type GeneratedGroups } from "@/lib/competition/draw";
import type { Player } from "@/types/competition";

type DrawPhase = "IDLE" | "DRAWING" | "COMPLETE";

type GroupDrawProps = {
  players: Player[];
  onComplete?: (groups: GeneratedGroups) => void;
};

export default function GroupDraw({ players, onComplete }: GroupDrawProps) {
  const [phase, setPhase] = useState<DrawPhase>("IDLE");
  const [generatedGroups, setGeneratedGroups] =
    useState<GeneratedGroups | null>(null);
  const [revealedCount, setRevealedCount] = useState(0);

  const drawOrder = generatedGroups?.drawOrder ?? [];

  const revealedPlayers = useMemo(
    () => drawOrder.slice(0, revealedCount),
    [drawOrder, revealedCount],
  );

  const revealedGroupA = useMemo(
    () => revealedPlayers.filter((_, playerIndex) => playerIndex % 2 === 0),
    [revealedPlayers],
  );

  const revealedGroupB = useMemo(
    () => revealedPlayers.filter((_, playerIndex) => playerIndex % 2 === 1),
    [revealedPlayers],
  );

  const activePlayer =
    phase === "DRAWING" ? drawOrder[revealedCount] : undefined;

  const activeDestination = revealedCount % 2 === 0 ? "Group A" : "Group B";

  useEffect(() => {
    if (phase !== "DRAWING") {
      return;
    }

    if (revealedCount >= drawOrder.length) {
      setPhase("COMPLETE");

      if (generatedGroups) {
        onComplete?.(generatedGroups);
      }

      return;
    }

    const timer = window.setTimeout(() => {
      setRevealedCount((currentCount) => currentCount + 1);
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [phase, revealedCount, drawOrder.length, generatedGroups, onComplete]);

  function startDraw() {
    try {
      const groups = generateGroups(players);

      setGeneratedGroups(groups);
      setRevealedCount(0);
      setPhase("DRAWING");
    } catch (error) {
      console.error("Unable to generate groups:", error);
    }
  }

  function resetDraw() {
    setGeneratedGroups(null);
    setRevealedCount(0);
    setPhase("IDLE");
  }

  const canStartDraw = players.length === 8;

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-400">
          Tournament draw
        </p>

        <h2 className="mt-3 text-3xl font-black">Generate groups</h2>

        <p className="mx-auto mt-3 max-w-xl text-zinc-400">
          Players will be drawn one at a time and assigned alternately to Group
          A and Group B.
        </p>
      </div>

      <div className="relative mt-10 min-h-40">
        <AnimatePresence mode="wait">
          {phase === "IDLE" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center"
            >
              <button
                type="button"
                onClick={startDraw}
                disabled={!canStartDraw}
                className="rounded-xl bg-amber-400 px-7 py-3 font-bold text-zinc-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Start group draw
              </button>

              {!canStartDraw && (
                <p className="mt-4 text-sm text-red-400">
                  Exactly eight players are required to start the draw.
                </p>
              )}
            </motion.div>
          )}

          {phase === "DRAWING" && activePlayer && (
            <motion.div
              key={activePlayer.id}
              initial={{
                opacity: 0,
                scale: 0.8,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.9,
                x: activeDestination === "Group A" ? -220 : 220,
              }}
              transition={{
                duration: 0.45,
              }}
              className="mx-auto max-w-sm rounded-2xl border border-amber-400 bg-zinc-950 p-6 text-center shadow-lg shadow-amber-400/10"
            >
              <div
                className="mx-auto h-14 w-14 rounded-full"
                style={{
                  backgroundColor: activePlayer.colour,
                }}
              />

              <p className="mt-4 text-2xl font-black">{activePlayer.name}</p>

              <p className="mt-2 text-sm font-bold uppercase tracking-widest text-amber-400">
                {activeDestination}
              </p>

              <p className="mt-4 text-sm text-zinc-500">
                Player {revealedCount + 1} of {drawOrder.length}
              </p>
            </motion.div>
          )}

          {phase === "COMPLETE" && (
            <motion.div
              key="complete"
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="text-center"
            >
              <p className="text-2xl font-black text-amber-400">
                Groups confirmed
              </p>

              <p className="mt-2 text-zinc-400">
                All eight players have been assigned.
              </p>

              <button
                type="button"
                onClick={resetDraw}
                className="mt-4 text-sm font-semibold text-zinc-400 transition hover:text-white"
              >
                Run mock draw again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <GroupCard title="Group A" players={revealedGroupA} totalSlots={4} />

        <GroupCard title="Group B" players={revealedGroupB} totalSlots={4} />
      </div>
    </section>
  );
}

type GroupCardProps = {
  title: string;
  players: Player[];
  totalSlots: number;
};

function GroupCard({ title, players, totalSlots }: GroupCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <h3 className="text-xl font-black">{title}</h3>

      <div className="mt-5 space-y-3">
        {Array.from({ length: totalSlots }).map((_, slotIndex) => {
          const player = players[slotIndex];

          return (
            <motion.div
              key={player?.id ?? `empty-${slotIndex}`}
              initial={
                player
                  ? {
                      opacity: 0,
                      x: 30,
                    }
                  : undefined
              }
              animate={{
                opacity: 1,
                x: 0,
              }}
              className="flex min-h-16 items-center rounded-xl border border-zinc-800 bg-zinc-900 px-4"
            >
              {player ? (
                <div className="flex items-center gap-3">
                  <span
                    className="h-4 w-4 rounded-full"
                    style={{
                      backgroundColor: player.colour,
                    }}
                  />

                  <div>
                    <p className="font-bold">{player.name}</p>

                    <p className="text-sm text-zinc-500">{player.shortName}</p>
                  </div>
                </div>
              ) : (
                <span className="text-sm font-semibold text-zinc-600">
                  Waiting for player...
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
