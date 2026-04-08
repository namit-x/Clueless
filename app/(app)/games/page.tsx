"use client";

import { Suspense } from "react";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTeamDashboardThunk } from "@/store/slices/teamSlice";
import { fetchGamesThunk } from "@/store/slices/gamesSlice";
import { selectAllGames, selectTeamBlocked, selectTeamStatus, selectGamesStatus } from "@/store/selectors/gameSelectors";
import GameLayout from "@/components/game/GameLayout";
import GameHeader from "@/components/game/GameHeader";
import TreasureHuntGame from "@/components/games/treasure-hunt/TreasureHuntGame";
import QuizGame from "@/components/games/quiz/QuizGame";
import DigitManipulationGame from "@/components/games/digit-manipulation/DigitManipulationGame";
import BlindCodeGame from "@/components/games/blind-code/BlindCodeGame";
import TeamBlockedScreen from "@/components/game/TeamBlockedScreen";
import LoadingGhost from "@/components/LoadingGhost";
import GameErrorBoundary from "@/components/GameErrorBoundary";

const NoActiveGame = () => (
  <div className="flex items-center justify-center min-h-[320px] p-8">
    <div className="text-center max-w-[360px]">
      <div className="w-16 h-16 mx-auto mb-5 rounded-xl bg-muted flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>        </div>
      <p className="text-base font-medium mb-2">No active game</p>
    </div>
  </div>
);

function GamesPageInner() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const selectedGameId = searchParams.get("gameId");

  const teamBlocked = useAppSelector(selectTeamBlocked);
  const teamStatus = useAppSelector(selectTeamStatus);
  const gamesStatus = useAppSelector(selectGamesStatus);
  const games = useAppSelector(selectAllGames);
  const selectedGame = games.find((game) => game.id === selectedGameId) ?? null;

  useEffect(() => {
    // Only fetch if not already loaded
    if (teamStatus === "idle") {
      dispatch(fetchTeamDashboardThunk());
    }

    if (gamesStatus === "idle") {
      dispatch(fetchGamesThunk());
    }
  }, [dispatch, teamStatus, gamesStatus]);

  const gameComponents: Record<string, JSX.Element> = {
    "Treasure Hunt": <TreasureHuntGame />,
    "Quiz V2": <QuizGame />,
    "Digit Manipulation": <DigitManipulationGame />,
    "Blind Code": <BlindCodeGame />,
  };
  if (teamBlocked) return <TeamBlockedScreen />;

  const isLoading = gamesStatus === "idle" || gamesStatus === "loading";

  return (
    <GameLayout>
      <GameHeader gName={selectedGame?.name ?? ""} />
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[320px]">
          <LoadingGhost />
        </div>
      ) : selectedGame ? (
        <GameErrorBoundary>
          {gameComponents[selectedGame.name] ?? <NoActiveGame />}
        </GameErrorBoundary>
      ) : (
        <NoActiveGame />
      )}
    </GameLayout>
  );



}
export default function GamesPage() {
  return (
    <Suspense fallback={null}>
      <GamesPageInner />
    </Suspense>
  );
}
