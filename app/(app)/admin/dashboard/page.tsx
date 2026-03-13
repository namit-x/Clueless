"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import GameControlPanel from "@/components/admin/GameControl/GameControlPanel";
import TeamControlPanel from "@/components/admin/TeamControl/TeamControlPanel";
import TeamProgressPanel from "@/components/admin/TeamProgress/TeamProgressPanel";
import AdminLogsPanel from "@/components/admin/AdminLogs/AdminLogsPanel";

export default function AdminDashboardPage() {

  const [activeSection, setActiveSection] = useState("games");

  return (
    <div className="flex h-screen">

      {/* Sidebar */}
      <div className="w-64 border-r p-4">
        <AdminSidebar
          activeSection={activeSection}
          onChangeSection={setActiveSection}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">

        {/* Header */}
        <div className="border-b p-4">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>

        {/* Section Rendering */}
        <div className="p-6">

          {activeSection === "games" && <GameControlPanel />}
          {activeSection === "teams" && <TeamControlPanel />}
          {activeSection === "progress" && <TeamProgressPanel />}
          {activeSection === "logs" && <AdminLogsPanel />}

        </div>

      </div>

    </div>
  );
}