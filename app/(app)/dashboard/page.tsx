"use client";

import { DashboardResponse } from "@/lib/types/dashboard";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import GamesGrid from "@/components/dashboard/GameGrid";
import TeamBlockedScreen from "@/components/game/TeamBlockedScreen";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [teamBlocked, setTeamBlocked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadDashboard() {
      try {
        // STEP 1 — check team status
        const teamRes = await fetch("/api/team/dashboard", {
          credentials: "include",
        });

        // auth expired handling
        if (teamRes.status === 401 || teamRes.status === 403) {
          alert("Your session expired. Please login again.");
          router.replace("/login");
          return;
        }

        const teamJson = await teamRes.json();
        console.log("Team dashboard data:", teamJson);

        if (!teamJson?.team) {
          alert("Your session expired. Please login again.");
          router.replace("/login");
          return;
        }

        if (teamJson.team?.isActive === false) {
          setTeamBlocked(true);
          return;
        } else {
          setTeamBlocked(false);
        }

        // STEP 2 — load user info
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          alert("Session data missing. Please login again.");
          router.replace("/login");
          return;
        }

        const user = JSON.parse(userStr);
        console.log("Dashboard loaded for user:", user);

        // STEP 3 — load games
        const res = await fetch("/api/game/current", {
          credentials: "include",
        });

        if (res.status === 401 || res.status === 403) {
          alert("Your session expired. Please login again.");
          router.replace("/login");
          return;
        }

        const gam = await res.json();
        console.log("Dashboard API raw:", gam);

        if (!gam?.success) {
          alert("Your session expired. Please login again.");
          router.replace("/login");
          return;
        }

        if (!gam?.game || !Array.isArray(gam.game)) {
          alert("Your session expired. Please login again.");
          router.replace("/login");
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
        alert("Something went wrong. Please login again.");
        router.replace("/login");
      }
    }

    loadDashboard();
  }, [router]);

  if (!data && !teamBlocked) return <div>Loading dashboard...</div>;

  if (teamBlocked) return <TeamBlockedScreen />;

  return (
    <div className="p-6">
      <DashboardHeader teamName={data?.team.name ?? ""} />
      <GamesGrid games={data?.games ?? []} />
    </div>
  );
}