"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { getCurrentTournamentHref } from "@/lib/competition/currentTournament";
import { COMPETITION_PROGRESS_EVENT } from "@/lib/competition/progression";

type NavigationItem = {
  label: string;
  href: string;
  match: (path: string) => boolean;
};

export default function MainHeader() {
  const pathname = usePathname();

  const [tournamentHref, setTournamentHref] = useState("/tournaments");

  useEffect(() => {
    const refreshTournamentHref = () => {
      setTournamentHref(getCurrentTournamentHref());
    };

    refreshTournamentHref();

    window.addEventListener("storage", refreshTournamentHref);

    window.addEventListener(COMPETITION_PROGRESS_EVENT, refreshTournamentHref);

    return () => {
      window.removeEventListener("storage", refreshTournamentHref);

      window.removeEventListener(
        COMPETITION_PROGRESS_EVENT,
        refreshTournamentHref,
      );
    };
  }, []);

  const navigation: NavigationItem[] = [
    {
      label: "Home",
      href: "/",
      match: (path) => path === "/",
    },
    {
      label: "Championship",
      href: "/championship",
      match: (path) => path.startsWith("/championship"),
    },
    {
      label: "Tournament",
      href: tournamentHref,
      match: (path) => path.startsWith("/tournaments"),
    },
    {
      label: "Players",
      href: "/players",
      match: (path) => path.startsWith("/players"),
    },
    {
      label: "Mentors",
      href: "/mentors",
      match: (path) => path.startsWith("/mentors"),
    },
    {
      label: "Stats",
      href: "/statistics",
      match: (path) => path.startsWith("/statistics"),
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-sm font-black text-zinc-950 transition group-hover:bg-amber-300">
            T&amp;A
          </span>

          <span className="hidden sm:block">
            <span className="block text-sm font-black uppercase tracking-widest text-white">
              Tits &amp; Ass
            </span>

            <span className="block text-xs text-zinc-500">
              Get Your Ass Wiped
            </span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="overflow-x-auto">
          <div className="flex min-w-max items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-1">
            {navigation.map((item) => {
              const active = item.match(pathname);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition sm:px-4 ${
                    active
                      ? "bg-amber-400 text-zinc-950"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
