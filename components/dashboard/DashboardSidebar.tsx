"use client";

import { LayoutDashboard, BarChart3, TrendingUp, Megaphone, UserCog, X } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "performance", label: "Performance", icon: BarChart3 },
  { id: "rank", label: "Rank History", icon: TrendingUp },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "account", label: "Account", icon: UserCog },
] as const;

export type TabId = (typeof tabs)[number]["id"];

interface DashboardSidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const DashboardSidebar = ({
  activeTab,
  onTabChange,
  mobileOpen,
  onMobileClose,
}: DashboardSidebarProps) => {
  const handleTabClick = (id: TabId) => {
    onTabChange(id);
    onMobileClose();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-border">
        <h2 className="font-display text-sm font-bold tracking-widest text-primary neon-text">
          CODE ARENA
        </h2>
        <p className="text-xs text-muted-foreground mt-1">Team Dashboard</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTabClick(id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
              activeTab === id
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground">AI × IoT Club</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 h-screen sticky top-0 flex-col bg-card border-r border-border">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-card border-r border-border animate-fade-up">
            <button
              onClick={onMobileClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default DashboardSidebar;