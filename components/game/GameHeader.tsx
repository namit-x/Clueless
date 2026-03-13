import { useEffect } from "react";

type GameHeaderProps = {
  gName: string
  // teamName: string
}

export default function GameHeader({
  gName,
  // teamName
}: GameHeaderProps) {

  // useEffect(() => {
  //   async function fetchCurrentGame() { 
  //     const res = await fetch("/api/game/current", {
  //       credentials: "include",
  //     });

  //     const json = await res.json();
  //     console.log("Current game data:", json);
  //   }

  //   fetchCurrentGame();
  // }, []);
  
  return (
    <div className="flex justify-between items-center p-4 border-b">

      <div>{gName}</div>


    </div>
  );
}