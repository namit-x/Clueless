"use client";

import GameLayout from "@/components/game/GameLayout";
import GameHeader from "@/components/game/GameHeader";
import { useEffect, useState } from "react";

import TreasureHuntGame from "@/components/games/treasure-hunt/TreasureHuntGame";
import QuizGame from "@/components/games/quiz/QuizGame";
import DigitManipulationGame from "@/components/games/digit-manipulation/DigitManipulationGame";
import BlindCodeGame from "@/components/games/blind-code/BlindCodeGame";
import TeamBlockedScreen from "@/components/game/TeamBlockedScreen";



export default function GamesPage() {
  const [currentGame, setCurrentGame] = useState<number>(0);
  const [gameName, setGameName] = useState<string>("");
  const [teamBlocked, setTeamBlocked] = useState(false);

 useEffect(() => {
    // defined INSIDE useEffect so it's never stale
async function checkTeamAccess() {
  const teamRes = await fetch("/api/team/dashboard", {
    credentials: "include",
  });

  const teamJson = await teamRes.json();
  console.log("Team dashboard data:", teamJson); // log the dashboard data for debugging

  if (teamJson.team?.isActive === false) {
    setTeamBlocked(true);
    return false;
  } else {
    setTeamBlocked(false);
    return true;
  }
}

async function init() {
  try {
    const isActive = await checkTeamAccess();
    if (!isActive) return;

    const res = await fetch("/api/game/current", { credentials: "include" });
    if (!res.ok) {
      console.error("Fetch failed:", res.status, res.statusText);
      return;
    }
    const json = await res.json();
    console.log("Current game data:", json);

    // Find the LIVE game in the array
    const liveGame = Array.isArray(json.game)
      ? json.game.find((g: any) => g.status === "LIVE")
      : null;

    if (liveGame) {
      setCurrentGame(liveGame.order_index);
      setGameName(liveGame.name);
    } else {
      setCurrentGame(0);
      setGameName("");
    }
  } catch (error) {
    console.error("Error in init():", error);
  }
}

init();

  }, []);


  const gameComponents: Record<number, JSX.Element> = {
    1: <TreasureHuntGame />,
    2: <QuizGame />,
    3: <DigitManipulationGame />,
    4: <BlindCodeGame />,
  };


  if (teamBlocked) {
    return <TeamBlockedScreen />;
  }

  return (
    <GameLayout>
      <GameHeader
        gName={gameName}
      />
      {gameComponents[currentGame] || <div>No game active</div>}
    </GameLayout>
  );
}