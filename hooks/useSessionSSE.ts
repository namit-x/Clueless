"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { forceLogout } from "@/store/slices/authSlice";

export function useSessionSSE() {
  const router = useRouter();
  const dispatch = useAppDispatch();

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

    es.addEventListener("FORCE_LOGOUT", () => {
      console.log("[SSE] force logout");
      alert("Your team member have logged into another device. You have been logged out.");
      es.close();
      dispatch(forceLogout());
    });

    es.onerror = (e) => {
      console.log("[SSE] error", e);
    };

    return () => es.close();
  }, [router]);
}
