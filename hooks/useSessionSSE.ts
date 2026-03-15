"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useSessionSSE() {
  const router = useRouter();

  useEffect(() => {
    const es = new EventSource("/api/auth/session/stream", {
      withCredentials: true,
    });

    es.addEventListener("CONNECTED", () => {
      console.log("[SSE] connected");
    });

    es.addEventListener("PING", () => {
      console.log("[SSE] ping");
    });

    es.addEventListener("FORCE_LOGOUT", async () => {
      console.log("[SSE] force logout");

      alert("Your team member have logged into another device. You have been logged out.");

      try {
        localStorage.removeItem("user");
      } catch {}

      es.close();

      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      router.replace("/login");
    });

    es.onerror = (e) => {
      console.log("[SSE] error", e);
    };

    return () => es.close();
  }, [router]);
}
