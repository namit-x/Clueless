"use client";

import {
  LayoutDashboard,
  Users,
  Gamepad2,
  Settings,
  UserCog,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type TabKey =
  | "overview"
  | "teams"
  | "game"
  | "settings"
  | "users";

interface AdminSidebarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  open: boolean;
  onClose: () => void;
}

const navItems: {
  id: TabKey;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "teams", label: "Teams", icon: Users },
  { id: "game", label: "Game Control", icon: Gamepad2 },
  { id: "settings", label: "Event Settings", icon: Settings },
  { id: "users", label: "Users", icon: UserCog },
];

export default function AdminSidebar({
  activeTab,
  onTabChange,
  open,
  onClose,
}: AdminSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-sidebar transition-transform duration-300 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center gap-2 border-b border-border px-5">
          <Gamepad2 className="h-6 w-6 text-[#8fff00]" />
          <span className="text-sm font-bold tracking-wider text-foreground">
            ADMIN
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-[#8fff00]/10 text-[#8fff00] shadow-[inset_0_0_20px_rgba(143,255,0,0.08)]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}