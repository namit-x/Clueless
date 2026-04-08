import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/store/hooks";
import { supabase } from "@/lib/supabase/client";
import { fetchGamesThunk } from "@/store/slices/gamesSlice";

/**
 * Hook to manage Supabase Realtime subscriptions for the team dashboard.
 *
 * Subscribes to:
 * - games table (UPDATE) — triggers refetch so the team sees game status
 *   changes (started / ended) without manual refresh.
 *
 * Refetches via API rather than patching Redux directly because the team
 * endpoint masks game IDs for non-LIVE games; the raw DB row cannot be
 * used safely.
 *
 * Safe patterns:
 * - Subscription created only once per mount
 * - Cleanup on unmount
 * - Errors logged but don't crash UI
 */
export function useTeamRealtimeSubscriptions() {
    const dispatch = useAppDispatch();
    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        let channel: ReturnType<typeof supabase.channel> | null = null;

        try {
            channel = supabase
                .channel("realtime:games:team")
                .on(
                    "postgres_changes",
                    {
                        event: "UPDATE",
                        schema: "public",
                        table: "games",
                    },
                    () => {
                        // Refetch so the server-side ID masking is applied correctly
                        dispatch(fetchGamesThunk());
                        console.log("[Realtime] Game updated, refetching for team");
                    }
                )
                .subscribe((status) => {
                    if (status === "SUBSCRIBED") {
                        console.log("[Realtime] Team subscribed to games");
                    } else if (status === "CHANNEL_ERROR") {
                        console.error("[Realtime] Team games channel error");
                    }
                });
        } catch (error) {
            console.error("[Realtime] Team subscription setup error:", error);
        }

        return () => {
            initializedRef.current = false;
            if (channel) supabase.removeChannel(channel);
        };
    }, [dispatch]);
}
