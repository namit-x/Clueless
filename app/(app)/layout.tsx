"use client";

import { useSessionRealtime } from "@/hooks/useSessionRealtime";

/**
 * Mounts the session realtime hook and renders the application's base layout with a full-screen decorative grid overlay.
 *
 * @param children - The page content to render inside the layout
 * @returns The layout element containing the non-interactive grid overlay and the provided `children`
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useSessionRealtime();

  return (
    <div className="min-h-screen bg-background atmosphere-medium relative">
      {/* Global grid overlay for app pages */}
      <div
        className="fixed inset-0 pointer-events-none grid-pattern opacity-[0.4]"
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
