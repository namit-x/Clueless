"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTeamDashboardThunk } from "@/store/slices/teamSlice";
import { fetchGamesThunk } from "@/store/slices/gamesSlice";
import { selectAllGames, selectTeamBlocked } from "@/store/selectors/gameSelectors";
import GameLayout from "@/components/game/GameLayout";
import GameHeader from "@/components/game/GameHeader";
import TreasureHuntGame from "@/components/games/treasure-hunt/TreasureHuntGame";
import QuizGame from "@/components/games/quiz/QuizGame";
import DigitManipulationGame from "@/components/games/digit-manipulation/DigitManipulationGame";
import BlindCodeGame from "@/components/games/blind-code/BlindCodeGame";
import TeamBlockedScreen from "@/components/game/TeamBlockedScreen";

export default function GamesPage() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const selectedGameId = searchParams.get("gameId");

  const teamBlocked = useAppSelector(selectTeamBlocked);
  const games = useAppSelector(selectAllGames);
  console.log("Games from store:", games); // Debug log to check games data
  const selectedGame = games.find((game) => game.id === selectedGameId) ?? null;

  useEffect(() => {
    dispatch(fetchTeamDashboardThunk());
    dispatch(fetchGamesThunk());
  }, [dispatch]);

  const gameComponents: Record<string, JSX.Element> = {
    "Treasure Hunt": <TreasureHuntGame />,
    "Quiz": <QuizGame />,
    "Digit Manipulation": <DigitManipulationGame />,
    "Blind Code": <BlindCodeGame />,
  };

  if (teamBlocked) return <TeamBlockedScreen />;

  return (
    <GameLayout>
      <GameHeader gName={selectedGame?.name ?? ""} />
      {selectedGame ? gameComponents[selectedGame.name] ?? <div>No game active</div> : <div>No game active</div>}

    </GameLayout>
  );
}
