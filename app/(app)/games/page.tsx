"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTeamDashboardThunk } from "@/store/slices/teamSlice";
import { fetchGamesThunk } from "@/store/slices/gamesSlice";
import { selectTeamBlocked, selectLiveGame } from "@/store/selectors/gameSelectors";
import GameLayout from "@/components/game/GameLayout";
import GameHeader from "@/components/game/GameHeader";
import TreasureHuntGame from "@/components/games/treasure-hunt/TreasureHuntGame";
import QuizGame from "@/components/games/quiz/QuizGame";
import DigitManipulationGame from "@/components/games/digit-manipulation/DigitManipulationGame";
import BlindCodeGame from "@/components/games/blind-code/BlindCodeGame";
import TeamBlockedScreen from "@/components/game/TeamBlockedScreen";

export default function GamesPage() {
  const dispatch = useAppDispatch();

  const teamBlocked = useAppSelector(selectTeamBlocked);
  const liveGame = useAppSelector(selectLiveGame);

  useEffect(() => {
    dispatch(fetchTeamDashboardThunk());
    dispatch(fetchGamesThunk());
  }, [dispatch]);

  const gameComponents: Record<number, JSX.Element> = {
    1: <TreasureHuntGame />,
    2: <QuizGame />,
    3: <DigitManipulationGame />,
    4: <BlindCodeGame />,
  };

  if (teamBlocked) return <TeamBlockedScreen />;

  return (
    <GameLayout>
      <GameHeader gName={liveGame?.name ?? ""} />
      {gameComponents[liveGame?.order_index ?? 0] || <div>No game active</div>}
    </GameLayout>
  );
}