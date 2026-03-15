import { RootState } from "../index";

export const selectAllAdminTeams = (state: RootState) => state.adminTeams.items;

export const selectAdminTeamsStatus = (state: RootState) => state.adminTeams.status;

export const selectAdminTeamStats = (state: RootState) => {
  const teams = state.adminTeams.items;
  const total = teams.length;
  const active = teams.filter((t) => t.is_approved).length;
  const blocked = total - active;
  return { total, active, blocked };
};

export const selectAdminTeamActionStatus = (teamId: string) => (state: RootState) =>
  state.adminTeams.actionStatusById[teamId] ?? "idle";