"use client";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useSessionRealtime } from "@/hooks/useSessionRealtime";
import FullscreenGuard from "@/components/FullscreenGuard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useSessionRealtime();
  const role = useSelector((state: RootState) => state.auth.user?.role);

  return (
    <FullscreenGuard enabled={role === "team"}>
      <div className="min-h-screen bg-background atmosphere-medium relative">
        <div className="fixed inset-0 pointer-events-none grid-pattern opacity-[0.4]" aria-hidden="true" />
        <div className="relative z-10">{children}</div>
      </div>
    </FullscreenGuard>
  );
}