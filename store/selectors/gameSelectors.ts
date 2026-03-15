import { RootState } from "../index";

export const selectAllGames = (state: RootState) => state.games.items;

export const selectGamesStatus = (state: RootState) => state.games.status;

export const selectLiveGame = (state: RootState) =>
  state.games.items.find((g) => g.status === "LIVE") ?? null;

type DashboardGame = {
  id: string;
  name: string;
  state: "NOT_STARTED" | "PAUSED" | "ENDED" | "ACTIVE";
};

export const selectDashboardGames = (state: RootState): DashboardGame[] =>
  state.games.items.map((g) => ({
    id: g.id ?? `locked-${g.name}`,
    name: g.name,
    state: (
      g.status === "LIVE"
        ? "ACTIVE"
        : g.status === "ENDED"
        ? "ENDED"
        : g.status === "PAUSED"
        ? "PAUSED"
        : "NOT_STARTED"
    ) as DashboardGame["state"],
  }));
export const selectTeamBlocked = (state: RootState) =>
  state.team.summary?.isActive === false;

export const selectTeamStatus = (state: RootState) => state.team.status;