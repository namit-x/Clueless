import { createSelector } from 'reselect';
import { RootState } from "../index";

export const selectAllGames = (state: RootState) => state.games.items;

export const selectGamesStatus = (state: RootState) => state.games.status;

export const selectLiveGame = (state: RootState) =>
  state.games.items.find((g) => g.is_active === true) ?? null;

type DashboardGame = {
  id: string;
  name: string;
  order_index: number;
  state: "NOT_STARTED" | "ACTIVE";
};

export const selectDashboardGames = createSelector(
  [(state: RootState) => state.games.items],
  (games) =>
    games.map((g) => ({
      id: g.id ?? `locked-${g.name}`,
      name: g.name,
      order_index: g.order_index,
      state: g.is_active ? "ACTIVE" : "NOT_STARTED" as DashboardGame["state"],
    }))
);

export const selectTeamBlocked = (state: RootState) =>
  state.team.summary?.is_active === false;

export const selectTeamStatus = (state: RootState) => state.team.status;