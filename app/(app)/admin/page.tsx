"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import AdminSidebar from "@/components/AdminDashboard/AdminSidebar";
import OverviewTab from "@/components/AdminDashboard/OverviewTab";
import TeamsTab from "@/components/AdminDashboard/TeamsTab";
import GameControlTab from "@/components/AdminDashboard/GameControlTab";
import EventSettingsTab from "@/components/AdminDashboard/EventSettingsTab";
import UsersTab from "@/components/AdminDashboard/UsersTab";

type TabKey = "overview" | "teams" | "game" | "settings" | "users";

const tabTitles: Record<TabKey, string> = {
  overview: "Overview",
  teams: "Teams",
  game: "Game Control",
  settings: "Event Settings",
  users: "Users",
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const content: Record<TabKey, React.ReactNode> = {
    overview: <OverviewTab />,
    teams: <TeamsTab />,
    game: <GameControlTab />,
    settings: <EventSettingsTab />,
    users: <UsersTab />,
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col md:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden rounded-md p-1.5 text-muted-foreground hover:bg-muted"
          >
            <Menu className="h-5 w-5" />
          </button>

          <h1 className="text-lg font-semibold text-foreground">
            {tabTitles[activeTab]}
          </h1>
        </header>

        <main className="flex-1 p-4 md:p-6">
          {content[activeTab]}
        </main>
      </div>
    </div>
  );
}