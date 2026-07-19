import GroupSection from "@/components/home/GroupSection";
import Hero from "@/components/home/Hero";
import LatestResults, {
  type LatestResult,
} from "@/components/home/LatestResults";
import StandingsPreview from "@/components/home/StandingsPreview";
import SummaryCards from "@/components/home/SummaryCards";
import TournamentTimeline from "@/components/home/TournamentTimeline";
import {
  groupAPlayers,
  groupBPlayers,
  seasonStandings,
  tournaments,
} from "@/lib/mockData";

function getTotal(points: number[]) {
  return points.reduce((total, value) => total + value, 0);
}

export default function HomePage() {
  const sortedStandings = [...seasonStandings].sort((a, b) => {
    const totalDifference =
      getTotal(b.tournamentPoints) - getTotal(a.tournamentPoints);

    if (totalDifference !== 0) {
      return totalDifference;
    }

    if (b.tournamentWins !== a.tournamentWins) {
      return b.tournamentWins - a.tournamentWins;
    }

    if (b.runnerUpFinishes !== a.runnerUpFinishes) {
      return b.runnerUpFinishes - a.runnerUpFinishes;
    }

    return b.semifinalFinishes - a.semifinalFinishes;
  });

  const leader = sortedStandings[0];
  const completedTournaments = 3;
  const currentTournament = tournaments[completedTournaments];

  const latestResults: LatestResult[] = [
    {
      id: "result-1",
      playerOne: "Mike",
      playerOneScore: 3,
      playerTwo: "Alex",
      playerTwoScore: 2,
    },
    {
      id: "result-2",
      playerOne: "Jack",
      playerOneScore: 3,
      playerTwo: "Harry",
      playerTwoScore: 1,
    },
    {
      id: "result-3",
      playerOne: "Tom",
      playerOneScore: 2,
      playerTwo: "Ben",
      playerTwoScore: 0,
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Hero />

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-10">
        <SummaryCards
          leader={leader}
          leaderPoints={getTotal(leader.tournamentPoints)}
          currentTournament={currentTournament}
          completedTournaments={completedTournaments}
          totalTournaments={tournaments.length}
        />

        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <StandingsPreview standings={sortedStandings} />
          <LatestResults results={latestResults} />
        </section>

        <GroupSection
          tournament={currentTournament}
          groupAPlayers={groupAPlayers}
          groupBPlayers={groupBPlayers}
        />

        <TournamentTimeline
          tournaments={tournaments}
          completedTournaments={completedTournaments}
        />
      </div>
    </main>
  );
}
