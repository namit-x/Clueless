"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAdminTeamsThunk, approveTeamThunk, rejectTeamThunk } from "@/store/slices/adminTeamsSlice";
import {
  selectAllAdminTeams,
  selectAdminTeamsStatus,
  selectAdminTeamStats,
  selectAdminTeamActionStatus,
} from "@/store/selectors/adminTeamsSelectors";

export default function TeamControlPanel() {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState("");

  const teams = useAppSelector(selectAllAdminTeams);
  const status = useAppSelector(selectAdminTeamsStatus);
  const { total, active, blocked } = useAppSelector(selectAdminTeamStats);

  useEffect(() => {
    dispatch(fetchAdminTeamsThunk());
  }, [dispatch]);

  const filteredTeams = useMemo(() => {
    return teams.filter((t) =>
      t.team_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [teams, search]);

  if (status === "idle") {
    return <div className="p-6 text-gray-500">Loading teams...</div>;
  }

  return (
    <div className="p-6 space-y-6">

      {/* STATS BAR */}
      <div className="flex gap-6">
        <div className="bg-gray-800 px-4 py-2 rounded-xl text-sm">
          Total Teams : <span className="font-semibold">{total}</span>
        </div>
        <div className="bg-green-800 px-4 py-2 rounded-xl text-sm">
          Active : <span className="font-semibold">{active}</span>
        </div>
        <div className="bg-red-800 px-4 py-2 rounded-xl text-sm">
          Blocked : <span className="font-semibold">{blocked}</span>
        </div>
      </div>

      {/* SEARCH */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search team name..."
        className="w-full border px-4 py-2 rounded-xl text-sm bg-gray-700 text-gray-200 outline-none focus:ring-2 focus:ring-blue-800 placeholder:text-gray-200"
      />

      {/* TEAM LIST */}
      <div className="space-y-4">
        {filteredTeams.map((team) => (
          <TeamRow key={team.team_id} team={team} />
        ))}

        {filteredTeams.length === 0 && (
          <div className="text-gray-400 text-sm text-center py-10">
            No teams found
          </div>
        )}
      </div>
    </div>
  );
}

function TeamRow({ team }: { team: { team_id: string; team_name: string; team_size: number; is_approved: boolean } }) {
  const dispatch = useAppDispatch();
  const actionStatus = useAppSelector(selectAdminTeamActionStatus(team.team_id));
  const isLoading = actionStatus === "loading:approve" || actionStatus === "loading:reject";

  return (
    <div className="border rounded-2xl p-4 flex items-center justify-between shadow-sm">
      <div>
        <h3 className="font-semibold text-lg">{team.team_name}</h3>
        <p className="text-sm text-gray-500">Team Size: {team.team_size}</p>
        <p className={`text-xs mt-1 font-medium ${team.is_approved ? "text-green-500" : "text-red-500"}`}>
          {team.is_approved ? "Active" : "Blocked"}
        </p>
      </div>

      <div>
        {team.is_approved ? (
          <button
            disabled={isLoading}
            onClick={() => dispatch(rejectTeamThunk(team.team_id))}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-gray-100 rounded-xl text-sm disabled:opacity-50"
          >
            {actionStatus === "loading:reject" ? "Blocking..." : "Block"}
          </button>
        ) : (
          <button
            disabled={isLoading}
            onClick={() => dispatch(approveTeamThunk(team.team_id))}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-gray-100 rounded-xl text-sm disabled:opacity-50"
          >
            {actionStatus === "loading:approve" ? "Enabling..." : "Enable"}
          </button>
        )}
      </div>
    </div>
  );
}