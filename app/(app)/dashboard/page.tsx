"use client";

import { DashboardResponse } from "@/lib/types/dashboard";
import { useEffect, useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import GamesGrid from "@/components/dashboard/GameGrid";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);

  useEffect(() => {
  async function loadDashboard() {
  // Get team data from localStorage (stored during login)
  
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    console.error('No user data found - user may not be logged in');
    // Handle redirect to login or error state
    return;
  }
  const user = JSON.parse(userStr);
  console.log("Loaded user from localStorage:", user);

  // Fetch games and penalty data from the API
  const res = await fetch("/api/game/current", {
    credentials: "include",
  });

  const json = await res.json();
  console.log("Game data:", json);

  // Combine: team name from login/localStorage, rest from API
  setData({
    team: {
      name: user.name,  // From login response
      // penalty_time_seconds: json.team.penalty_time_seconds,  // From API
    },
    // games: json.games,  // From API
  });
}

    loadDashboard();
  }, []);

  if (!data) return <div>Loading dashboard...</div>;

  return (
    <div className="p-6">

      <DashboardHeader
        teamName={data.team.name}
        // penaltyTime={data.team.penalty_time_seconds}
      />

      {/* <GamesGrid games={data.games} /> */}

    </div>
  );
}
