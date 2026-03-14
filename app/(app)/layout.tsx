"use client";

import { useSessionSSE } from "@/hooks/useSessionSSE";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useSessionSSE();

  return (
    <div className="min-h-screen bg-background gradient-bg">
      {children}
    </div>
  );
}
