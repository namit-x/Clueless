"use client";

import GameLayout from "@/components/game/GameLayout";
import GameHeader from "@/components/game/GameHeader";
import { useEffect, useState } from "react";

import TreasureHuntGame from "@/components/games/treasure-hunt/TreasureHuntGame";
import QuizGame from "@/components/games/quiz/QuizGame";
import DigitManipulationGame from "@/components/games/digit-manipulation/DigitManipulationGame";
import BlindCodeGame from "@/components/games/blind-code/BlindCodeGame";


export default function GamesPage() {
  const [currentGame, setCurrentGame] = useState<number>(0);
  const [gameName, setGameName] = useState<string>("");
  useEffect(() => {
    async function fetchCurrentGame() {
      const res = await fetch('/api/games/current',{
        credentials: 'include',
      });

      const json = await res.json();
      setCurrentGame(json.game.order_index);
      setGameName(json.game.name);
      
    }

    fetchCurrentGame();
  }, []);

  const gameComponents: Record<number, JSX.Element> = {
    1: <TreasureHuntGame />,
    2: <QuizGame />,
    3: <DigitManipulationGame />,
    4: <BlindCodeGame />,
  };

  return (
    <GameLayout>

      <GameHeader
        gName={gameName}
      />
      {gameComponents[currentGame] || <div>No game active</div>}

    </GameLayout>
  );
}