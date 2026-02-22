'use client';

import { useState } from "react";
import { Menu } from "lucide-react";
import DashboardSidebar, { type TabId } from "@/components/dashboard/DashboardSidebar";
import OverviewTab from "@/components/dashboard/OverviewTabs";
import PerformanceTab from "@/components/dashboard/PerformanceTab";
import RankHistoryTab from "@/components/dashboard/RankHistoryTab";
import AnnouncementsTab from "@/components/dashboard/AnnouncementsTab";
import AccountTab from "@/components/dashboard/AccountTab";
import { mockTeam } from "@/components/dashboard/mockData";

const tabTitles: Record<TabId, string> = {
  overview: "Overview",
  performance: "Performance",
  rank: "Rank History",
  announcements: "Announcements",
  account: "Account",
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderTab = () => {
    switch (activeTab) {
      case "overview": return <OverviewTab />;
      case "performance": return <PerformanceTab />;
      case "rank": return <RankHistoryTab />;
      case "announcements": return <AnnouncementsTab />;
      case "account": return <AccountTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background gradient-bg flex">
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
          <div>
            <p className="font-display text-sm font-bold tracking-wider text-primary">{mockTeam.name}</p>
            <p className="text-xs text-muted-foreground">Dashboard</p>
          </div>
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <h1 className="font-display text-xl font-bold tracking-wider mb-6">{tabTitles[activeTab]}</h1>
          {renderTab()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
