"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type RoundProgress = {
  roundNumber: number;
  status: string;
  attempts: number;
  startedAt: string | null;
  completedAt: string | null;
};

type TeamProgress = {
  teamId: string;
  teamName: string;
  rounds: RoundProgress[];
};

export default function TeamProgressPanel() {

  const [teams, setTeams] = useState<TeamProgress[]>([]);
  const [selected, setSelected] = useState<TeamProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/v1/admin/teams-progress");
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

  useEffect(() => {
    load();

    // Refresh progress whenever any team advances or fails a round
    channelRef.current = supabase
      .channel("realtime:team_round_progress:panel")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "team_round_progress" },
        () => { load(); }
      )
      .subscribe();

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
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

        {teams.map(team => {
          const latest = team.rounds.length > 0
            ? team.rounds[team.rounds.length - 1]
            : null;
          return (
            <div
              key={team.teamId}
              onClick={() => setSelected(team)}
              className="bg-gray-800 hover:bg-gray-700 p-3 rounded-xl mb-2 cursor-pointer transition"
            >
              <p className="font-medium">{team.teamName}</p>

              <div className="text-xs text-gray-400 flex justify-between mt-1">
                <span>Round {latest?.roundNumber ?? "-"}</span>
                <span>{latest?.status ?? "NOT STARTED"}</span>
              </div>
            </div>
          );
        })}
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

            {selected.rounds.length === 0 && (
              <p className="text-gray-400 text-sm">No round progress yet</p>
            )}

            <div className="space-y-4">
              {selected.rounds.map((r) => (
                <div key={r.roundNumber} className="bg-gray-800 rounded-xl p-4 space-y-1 text-sm">
                  <p className="font-medium">Round {r.roundNumber}</p>
                  <p>Status: {r.status}</p>
                  <p>Attempts: {r.attempts}</p>
                  <p>Started At: {r.startedAt ?? "-"}</p>
                  <p>Completed At: {r.completedAt ?? "-"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}