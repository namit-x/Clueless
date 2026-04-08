"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { forceLogout } from "@/store/slices/authSlice";
import { supabase } from "@/lib/supabase/client";

const POLL_INTERVAL_MS = 15_000;

/**
 * Monitors the current session for remote invalidation.
 *
 * Strategy:
 * - Calls /api/auth/session (uses the cookie, checks the DB) to verify the session.
 * - Polls every 15 seconds as a fallback.
 * - Also subscribes to Supabase Realtime on the sessions table for instant notification.
 *
 * Previous bug: queried Supabase directly with the anon key, which is blocked by RLS,
 * causing .maybeSingle() to return null → forced logout on every poll.
 */
export function useSessionRealtime() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);

    const hasLoggedOutRef = useRef(false);

    useEffect(() => {
        if (!user?.id || !user?.sessionId) return;

        const ownerType = user.role;
        const ownerId = user.id;
        const currentSessionId = user.sessionId;

        let isActive = true;

        async function verifySession() {
            if (!isActive || hasLoggedOutRef.current) return;

            try {
                const res = await fetch("/api/auth/session", { credentials: "include" });
                const data = await res.json();

                if (!data.valid || data.sessionId !== currentSessionId) {
                    if (hasLoggedOutRef.current) return;
                    hasLoggedOutRef.current = true;

                    console.log("[Session] Session replaced or expired, forcing logout");
                    alert("Your session has ended. You may have logged in from another device.");
                    dispatch(forceLogout());
                }
            } catch (err) {
                // Network error — don't log out, just skip this check
                console.error("[Session] Verification fetch failed:", err);
            }
        }

        // Polling fallback
        const interval = setInterval(verifySession, POLL_INTERVAL_MS);

        // Realtime: fires immediately when another login replaces this session
        const channel = supabase
            .channel(`session:${ownerType}:${ownerId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "sessions",
                    filter: `owner_id=eq.${ownerId}`,
                },
                (payload) => {
                    if (payload.new.owner_type !== ownerType) return;
                    verifySession();
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "sessions",
                    filter: `owner_id=eq.${ownerId}`,
                },
                (payload) => {
                    if (payload.new.owner_type !== ownerType) return;
                    verifySession();
                }
            )
            .subscribe((status) => {
                if (status === "SUBSCRIBED") {
                    console.log("[Session] Subscribed to realtime session changes");
                } else if (status === "CHANNEL_ERROR") {
                    console.error("[Session] Realtime channel error");
                }
            });

        return () => {
            isActive = false;
            clearInterval(interval);
            supabase.removeChannel(channel);
        };

    }, [user?.id, user?.sessionId, user?.role, dispatch]);
}
