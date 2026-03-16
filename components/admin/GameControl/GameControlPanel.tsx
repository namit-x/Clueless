"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAdminGamesThunk } from "@/store/slices/adminGamesSlice";
import {
  selectSortedAdminGames,
  selectAdminGamesStatus,
} from "@/store/selectors/adminSelectors";
import GameCard from "./GameCard";

export default function GameControlPanel() {
  const dispatch = useAppDispatch();

  const games = useAppSelector(selectSortedAdminGames);
  const status = useAppSelector(selectAdminGamesStatus);

  useEffect(() => {
    dispatch(fetchAdminGamesThunk());
  }, [dispatch]);

  if (status === "idle") return <div>Loading games...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Game Control</h2>

      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}