"use client";

import { DashboardResponse } from "@/lib/types/dashboard";
import { useEffect, useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import GamesGrid from "@/components/dashboard/GameGrid";
import TeamBlockedScreen from "@/components/game/TeamBlockedScreen";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [teamBlocked, setTeamBlocked] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        // ✅ STEP 1 — check team status
        const teamRes = await fetch("/api/team/dashboard", {
          credentials: "include",
        });
        const teamJson = await teamRes.json();
        console.log("Team dashboard data:", teamJson);

        if (teamJson.team?.isActive === false) {
          setTeamBlocked(true);
          return; // 🚨 stop here if blocked
        } else {
          setTeamBlocked(false);
        }

        // ✅ STEP 2 — only if active → load rest
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          console.error("No user data found - user may not be logged in");
          return;
        }

        const user = JSON.parse(userStr);
        console.log("Dashboard loaded for user:", user);

        const res = await fetch("/api/game/current", {
          credentials: "include",
        });

        const gam = await res.json();
        console.log("Dashboard API raw:", gam);

        if (!gam?.game || !Array.isArray(gam.game)) {
          console.error("Invalid games response shape");
          return;
        }

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

    // ✅ call once on load
    loadDashboard();

    // ✅ then poll every 5 seconds
    const interval = setInterval(loadDashboard, 5000);

    // ✅ cleanup on unmount
    return () => clearInterval(interval);
  }, []);

  if (!data && !teamBlocked) return <div>Loading dashboard...</div>;

  if (teamBlocked) {
    return <TeamBlockedScreen />;
  }

  return (
    <div className="p-6">
      <DashboardHeader teamName={data?.team.name ?? ""} />
      <GamesGrid games={data?.games ?? []} />
    </div>
  );
}