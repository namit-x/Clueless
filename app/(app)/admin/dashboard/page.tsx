"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import GameControlPanel from "@/components/admin/GameControl/GameControlPanel";
import TeamControlPanel from "@/components/admin/TeamControl/TeamControlPanel";
import TeamProgressPanel from "@/components/admin/TeamProgress/TeamProgressPanel";
import AdminLogsPanel from "@/components/admin/AdminLogs/AdminLogsPanel";

import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { clearUser } from "@/store/slices/authSlice";
import { useRealtimeSubscriptions } from "@/hooks/useRealtimeSubscriptions";

export default function AdminDashboardPage() {

  const [activeSection, setActiveSection] = useState("games");
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Initialize realtime subscriptions for teams and progress
  useRealtimeSubscriptions();
  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      dispatch(clearUser());
      router.replace("/");
    }
  }


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
        <div className="flex items-center justify-between border-b p-4">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>

          <button
            onClick={handleLogout}
            className="rounded-md border border-red-400 px-4 py-2 text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
          >
            Logout
          </button>
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