import { RootState } from "../index";

export const selectAdminGames = (state: RootState) => state.adminGames.items;

export const selectAdminGamesStatus = (state: RootState) => state.adminGames.status;

export const selectSortedAdminGames = (state: RootState) =>
  [...state.adminGames.items].sort((a, b) => a.order_index - b.order_index);

export const selectActiveAdminGame = (state: RootState) =>
  state.adminGames.items.find(
    (g) => g.status === "running" || g.status === "paused"
  ) ?? null;

export const selectLastEndedAdminGame = (state: RootState) =>
  [...state.adminGames.items]
    .filter((g) => g.status === "ended")
    .sort((a, b) => b.order_index - a.order_index)[0] ?? null;