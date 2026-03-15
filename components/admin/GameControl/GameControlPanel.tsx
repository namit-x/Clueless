"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAdminGamesThunk } from "@/store/slices/adminGamesSlice";
import {
  selectSortedAdminGames,
  selectAdminGamesStatus,
  selectActiveAdminGame,
  selectLastEndedAdminGame,
} from "@/store/selectors/adminSelectors";
import GameCard from "./GameCard";

export default function GameControlPanel() {
  const dispatch = useAppDispatch();

  const games = useAppSelector(selectSortedAdminGames);
  const status = useAppSelector(selectAdminGamesStatus);
  const activeGame = useAppSelector(selectActiveAdminGame);
  const lastEndedGame = useAppSelector(selectLastEndedAdminGame);

  useEffect(() => {
    dispatch(fetchAdminGamesThunk());
  }, [dispatch]);

  if (status === "loading" || status === "idle") return <div>Loading games...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Game Control</h2>

      {games.map((game) => {
        let isStartAllowed = false;

        if (activeGame) {
          isStartAllowed = false;
        } else if (!lastEndedGame) {
          isStartAllowed = game.order_index === 1;
        } else {
          isStartAllowed = game.order_index === lastEndedGame.order_index + 1;
        }

        return (
          <GameCard
            key={game.id}
            game={game}
            isStartAllowed={isStartAllowed}
          />
        );
      })}
    </div>
  );
}