"use client";

import { useEffect, useMemo, useState } from "react";

type Team = {
  team_id: string;
  team_name: string;
  team_size: number;
  is_approved: boolean;
};

export default function TeamControlPanel() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function fetchTeams() {
    try {
      const res = await fetch("/api/v1/admin/teams");
      const data = await res.json();
      setTeams(data.teams || []);
      console.log
    } catch (err) {
      console.error("Failed to fetch teams", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTeams();
  }, []);

  async function enableTeam(teamId: string) {
    setActionLoadingId(teamId);

    setTeams((prev) =>
      prev.map((t) =>
        t.team_id === teamId ? { ...t, is_approved: true } : t
      )
    );

    try {
      await fetch(`/api/v1/admin/teams/${teamId}/approve`, {
        method: "PATCH",
      });
    } catch {
      fetchTeams();
    } finally {
      setActionLoadingId(null);
    }
  }

  async function blockTeam(teamId: string) {
    setActionLoadingId(teamId);

    setTeams((prev) =>
      prev.map((t) =>
        t.team_id === teamId ? { ...t, is_approved: false } : t
      )
    );

    try {
      await fetch(`/api/v1/admin/teams/${teamId}/reject`, {
        method: "PATCH",
      });
    } catch {
      fetchTeams();
    } finally {
      setActionLoadingId(null);
    }
  }

  // ⭐ search filter
  const filteredTeams = useMemo(() => {
    return teams.filter((t) =>
      t.team_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [teams, search]);

  // ⭐ stats
  const total = teams.length;
  const active = teams.filter((t) => t.is_approved).length;
  const blocked = total - active;

  if (loading) {
    return <div className="p-6 text-gray-500">Loading teams...</div>;
  }

  return (
    <div className="p-6 space-y-6">

      {/* ⭐ STATS BAR */}
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

      {/* ⭐ SEARCH */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search team name..."
        className="w-full border px-4 py-2 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-800 placeholder:text-gray-900"
      />

      {/* ⭐ TEAM LIST */}
      <div className="space-y-4">
        {filteredTeams.map((team) => (
          <div
            key={team.team_id}
            className="border rounded-2xl p-4 flex items-center justify-between shadow-sm"
          >
            <div>
              <h3 className="font-semibold text-lg">{team.team_name}</h3>

              <p className="text-sm text-gray-500">
                Team Size: {team.team_size}
              </p>

              <p
                className={`text-xs mt-1 font-medium ${
                  team.is_approved ? "text-green-500" : "text-red-500"
                }`}
              >
                {team.is_approved ? "Active" : "Blocked"}
              </p>
            </div>

            <div>
              {team.is_approved ? (
                <button
                  disabled={actionLoadingId === team.team_id}
                  onClick={() => blockTeam(team.team_id)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-gray-700 rounded-xl text-sm disabled:opacity-50"
                >
                  {actionLoadingId === team.team_id ? "Blocking..." : "Block"}
                </button>
              ) : (
                <button
                  disabled={actionLoadingId === team.team_id}
                  onClick={() => enableTeam(team.team_id)}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-gray-700 rounded-xl text-sm disabled:opacity-50"
                >
                  {actionLoadingId === team.team_id ? "Enabling..." : "Enable"}
                </button>
              )}
            </div>
          </div>
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