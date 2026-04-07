"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { forceLogout } from "@/store/slices/authSlice";
import { supabase } from "@/lib/supabase/client";

const POLL_INTERVAL_MS = 15_000;

/**
 * Monitor the authenticated user's session in Supabase and force a logout if the session is replaced or removed.
 *
 * Subscribes to realtime changes on the `sessions` table filtered by the current user and uses periodic polling as a fallback to detect session replacement or deletion; triggers a one-time forced logout when the stored session no longer matches the current session ID.
 */
export function useSessionRealtime() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const subscribedRef = useRef(false);
    const hasLoggedOutRef = useRef(false);

    useEffect(() => {
        if (!user?.id || !user?.sessionId) return;
        if (subscribedRef.current) return;
        subscribedRef.current = true;

        const ownerId = user.id;
        const currentSessionId = user.sessionId;

        /**
         * Verifies that the stored session for the current owner still matches the hook's tracked session and triggers logout if it has been replaced or removed.
         *
         * If the session is missing or its `session_id` differs from the tracked `currentSessionId`, marks the logout as performed, shows an alert to the user, and dispatches a forced logout action. No action is taken if logout has already been performed.
         */
        async function verifySession() {
            if (hasLoggedOutRef.current) return;

            try {
                const { data, error } = await supabase
                    .from("sessions")
                    .select("session_id")
                    .eq("owner_id", ownerId)
                    .maybeSingle();

                if (error) {
                    console.error("[Realtime] Session verification query failed:", error);
                    return;
                }

                if (!data || data.session_id !== currentSessionId) {
                    if (hasLoggedOutRef.current) return;
                    hasLoggedOutRef.current = true;

                    console.log("[Realtime] Session invalid, forcing logout");
                    alert(
                        "Your team member have logged into another device. You have been logged out."
                    );
                    dispatch(forceLogout());
                }
            } catch (err) {
                console.error("[Realtime] Session verification error:", err);
            }
        }

        // Periodic fallback in case realtime events are missed
        const interval = setInterval(verifySession, POLL_INTERVAL_MS);

        const channel = supabase
            .channel(`session:${ownerId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "sessions",
                    filter: `owner_id=eq.${ownerId}`,
                },
                () => {
                    verifySession();
                }
            )
            .subscribe((status) => {
                if (status === "SUBSCRIBED") {
                    console.log("[Realtime] Subscribed to session changes");
                } else if (status === "CHANNEL_ERROR") {
                    console.error("[Realtime] Session channel error");
                }
            });

        return () => {
            subscribedRef.current = false;
            clearInterval(interval);
            supabase.removeChannel(channel);
        };
    }, [user?.id, user?.sessionId, dispatch]);
}
