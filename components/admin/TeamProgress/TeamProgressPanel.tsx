"use client";

import { useEffect, useState } from "react";

type TeamProgress = {
  teamId: string;
  teamName: string;
  roundNumber?: number;
  status?: string;
  attempts?: number;
  startedAt?: string | null;
  completedAt?: string | null;
};

export default function TeamProgressPanel() {

  const [teams, setTeams] = useState<TeamProgress[]>([]);
  const [selected, setSelected] = useState<TeamProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/admin/teams-progress"); // future ready
        const data = await res.json();

        if (data.success) {
          setTeams(data.teams);
        }
      } catch (e) {
        console.log("Progress API not ready");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="flex gap-6 h-full">

      {/* LEFT PANEL */}
      <div className="w-1/3 bg-gray-900 rounded-2xl p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Team Progress</h2>

        {loading && (
          <p className="text-gray-400 text-sm">Loading...</p>
        )}

        {!loading && teams.length === 0 && (
          <p className="text-gray-500 text-sm">
            Backend progress API not ready
          </p>
        )}

        {teams.map(team => (
          <div
            key={team.teamId}
            onClick={() => setSelected(team)}
            className="bg-gray-800 hover:bg-gray-700 p-3 rounded-xl mb-2 cursor-pointer transition"
          >
            <p className="font-medium">{team.teamName}</p>

            <div className="text-xs text-gray-400 flex justify-between mt-1">
              <span>Round {team.roundNumber ?? "-"}</span>
              <span>{team.status ?? "UNKNOWN"}</span>
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 bg-gray-900 rounded-2xl p-6">
        {!selected && (
          <p className="text-gray-400">
            Select a team to view detailed progress
          </p>
        )}

        {selected && (
          <div>
            <h2 className="text-xl font-semibold mb-6">
              {selected.teamName}
            </h2>

            <div className="space-y-3 text-sm">
              <p>Current Round: {selected.roundNumber ?? "-"}</p>
              <p>Status: {selected.status ?? "-"}</p>
              <p>Attempts: {selected.attempts ?? "-"}</p>
              <p>Started At: {selected.startedAt ?? "-"}</p>
              <p>Completed At: {selected.completedAt ?? "-"}</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}