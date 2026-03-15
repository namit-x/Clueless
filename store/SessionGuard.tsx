"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "./hooks";
import { resetForcedLogout } from "./slices/authSlice";

export function SessionGuard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const forcedLogout = useAppSelector((state) => state.auth.forcedLogout);

  useEffect(() => {
    if (!forcedLogout) return;

    const cleanup = async () => {
      try {
        localStorage.removeItem("user");
      } catch {}

      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      dispatch(resetForcedLogout());
      router.replace("/login");
    };

    cleanup();
  }, [forcedLogout, dispatch, router]);

  return null;
}