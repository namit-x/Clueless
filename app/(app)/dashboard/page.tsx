"use client";

import { DashboardResponse } from "@/lib/types/dashboard";
import { useEffect, useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import GamesGrid from "@/components/dashboard/GameGrid";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Get team data from localStorage
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          console.error("No user data found - user may not be logged in");
          return;
        }

        const user = JSON.parse(userStr);
        console.log("Dashboard loaded for user:", user);

        // Fetch games
        const res = await fetch("/api/game/current", {
          credentials: "include",
        });

        const gam = await res.json();
        console.log("Dashboard API raw:", gam);

        if (!gam?.game || !Array.isArray(gam.game)) {
          console.error("Invalid games response shape");
          return;
        }

        // IMPORTANT: do NOT filter null ids
          const gamesData = gam.game.map((g: any) => ({
            id: g.id ?? `locked-${g.name}`,
            name: g.name,
            state:
            g.status === "LIVE"     
              ? "ACTIVE"
              : g.status === "ENDED"  
              ? "ENDED"
              : g.status === "PAUSED"
              ? "PAUSED"
              : "NOT_STARTED",
                    }));
            console.log("Dashboard processed games:", gamesData);

        setData({
          team: {
            name: user.name,
          },
          games: gamesData,
        });

      } catch (err) {
        console.error("Dashboard load failed:", err);
      }
    }

    loadDashboard();
  }, []);

  if (!data) return <div>Loading dashboard...</div>;

  return (
    <div className="p-6">
      <DashboardHeader teamName={data.team.name} />
      <GamesGrid games={data.games} />
    </div>
  );
}