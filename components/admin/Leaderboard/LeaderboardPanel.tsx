"use client";

import { useEffect, useState } from "react";

type LeaderboardEntry = {
  teamId: string;
  teamName: string;
  totalTime: number;
  gamesSolved: number;
  rank: number;
};

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

const RANK_STYLES: Record<number, string> = {
  1: "text-yellow-400 font-bold",
  2: "text-gray-300 font-bold",
  3: "text-amber-600 font-bold",
};

export default function LeaderboardPanel() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");

  async function fetchLeaderboard() {
    setStatus("loading");
    try {
      const res = await fetch("/api/admin/leaderboard", {
        credentials: "include",
      });
      const data = await res.json();
      console.log("Fetched leaderboard:", data);
      if (!data.success) throw new Error(data.error ?? "Failed to fetch leaderboard");
      setLeaderboard(data.leaderboard);
      setStatus("success");
    } catch (err: any) {
      setError(err.message ?? "Unknown error");
      setStatus("error");
    }
  }

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (status === "loading") {
    return (
      <div className="p-6 text-gray-400 text-sm">Loading leaderboard...</div>
    );
  }

  if (status === "error") {
    return (
      <div className="p-6 space-y-3">
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={fetchLeaderboard}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Leaderboard</h2>
          <p className="text-sm text-gray-400 mt-1">Top {leaderboard.length} teams ranked by games solved and total time</p>
        </div>
        <button
          onClick={fetchLeaderboard}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm transition"
        >
          Refresh
        </button>
      </div>

      {/* Table */}
      {leaderboard.length === 0 ? (
        <div className="text-gray-400 text-sm text-center py-16">No leaderboard data available yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 text-gray-400 text-left">
                <th className="px-5 py-3 font-medium w-16">Rank</th>
                <th className="px-5 py-3 font-medium">Team</th>
                <th className="px-5 py-3 font-medium text-center">Games Solved</th>
                <th className="px-5 py-3 font-medium text-right">Total Time</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => (
                <tr
                  key={entry.teamId}
                  className={`border-t border-gray-700 transition-colors ${
                    idx % 2 === 0 ? "bg-gray-900" : "bg-gray-800/50"
                  } hover:bg-gray-700/60`}
                >
                  <td className="px-5 py-3">
                    <span className={`text-base ${RANK_STYLES[entry.rank] ?? "text-gray-300"}`}>
                      {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-white">{entry.teamName}</td>
                  <td className="px-5 py-3 text-center">
                    <span className="bg-green-800/50 text-green-300 px-3 py-1 rounded-full text-xs font-semibold">
                      {entry.gamesSolved}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-gray-300 font-mono">
                    {formatTime(entry.totalTime)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
