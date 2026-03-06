"use client";

import { DashboardResponse } from "@/lib/types/dashboard";
import { useEffect, useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import GamesGrid from "@/components/dashboard/GameGrid";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      const res = await fetch("/api/team/dashboard", {
        credentials: "include",
      });

      const json = await res.json();
      setData(json);
    }

    loadDashboard();
  }, []);

  if (!data) return <div>Loading dashboard...</div>;

  return (
    <div className="p-6">

      <DashboardHeader
        teamName={data.team.name}
        penaltyTime={data.team.penalty_time_seconds}
      />

      <GamesGrid games={data.games} />

    </div>
  );
}