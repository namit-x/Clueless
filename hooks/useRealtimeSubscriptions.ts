import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/store/hooks";
import { supabase } from "@/lib/supabase/client";
import {
    upsertAdminTeam,
    removeAdminTeam,
} from "@/store/slices/adminTeamsSlice";
import {
    upsertAdminGame,
    removeAdminGame,
} from "@/store/slices/adminGamesSlice";

/**
 * Hook to manage Supabase Realtime subscriptions for admin dashboard
 * 
 * Subscribes to:
 * - teams table (INSERT, UPDATE, DELETE)
 * - team_round_progress table (UPDATE) - triggers refetch for consistency
 * 
 * Updates Redux state directly via UPSERT/DELETE actions
 * 
 * Safe patterns:
 * - Subscriptions created only once per mount
 * - Cleanup properly on unmount
 * - Errors logged but don't crash UI
 * - Initial API fetch remains unchanged
 */
export function useRealtimeSubscriptions() {
    const dispatch = useAppDispatch();
    const subscriptionsRef = useRef<Map<string, any>>(new Map());
    const initializedRef = useRef(false);

    useEffect(() => {
        // Guard: only initialize once per mount
        if (initializedRef.current) return;
        initializedRef.current = true;

        try {
            subscribeToGames();
            subscribeToTeams();
        } catch (error) {
            console.error("[Realtime] Subscription setup error:", error);
        }

        // Cleanup: remove subscriptions on unmount
        return () => {
            subscriptionsRef.current.forEach((channel, key) => {
                supabase.removeChannel(channel);
                subscriptionsRef.current.delete(key);
            });
        };
    }, [dispatch]);

    /**
     * Subscribe to games table
     * Events: INSERT, UPDATE, DELETE
     *
     * Behavior:
     * - INSERT/UPDATE → dispatch upsertAdminGame (game status changes appear instantly)
     * - DELETE → dispatch removeAdminGame
     */
    function subscribeToGames() {
        const channel = supabase
            .channel("realtime:games")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "games",
                },
                (payload: any) => {
                    try {
                        if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
                            if (payload.new) {
                                const raw = payload.new;
                                const game = {
                                    id: raw.id,
                                    name: raw.name,
                                    order_index: raw.order_index,
                                    status: raw.status === "NOT_STARTED" ? "pending"
                                        : raw.status === "LIVE" ? "running"
                                        : "ended",
                                    started_at: raw.started_at ?? null,
                                    paused_at: raw.paused_at ?? null,
                                    resumed_at: raw.resumed_at ?? null,
                                    ended_at: raw.ended_at ?? null,
                                };
                                dispatch(upsertAdminGame(game));
                                console.log("[Realtime] Game updated:", payload.eventType, game.id);
                            }
                        } else if (payload.eventType === "DELETE") {
                            if (payload.old) {
                                dispatch(removeAdminGame(payload.old.id));
                                console.log("[Realtime] Game removed:", payload.old.id);
                            }
                        }
                    } catch (error) {
                        console.error("[Realtime] Games event error:", error);
                    }
                }
            )
            .subscribe((status) => {
                if (status === "SUBSCRIBED") {
                    console.log("[Realtime] Subscribed to games");
                } else if (status === "CHANNEL_ERROR") {
                    console.error("[Realtime] Games channel error");
                } else if (status === "CLOSED") {
                    console.warn("[Realtime] Games channel closed");
                }
            });

        subscriptionsRef.current.set("games", channel);
    }

    /**
     * Subscribe to teams table
     * Events: INSERT, UPDATE, DELETE
     * 
     * Behavior:
     * - INSERT → dispatch upsertAdminTeam (new team appears in list)
     * - UPDATE → dispatch upsertAdminTeam (team approval status changes)
     * - DELETE → dispatch removeAdminTeam (team removed from list)
     */
    function subscribeToTeams() {
        const channel = supabase
            .channel("realtime:teams")
            .on(
                "postgres_changes",
                {
                    event: "*", // All events: INSERT, UPDATE, DELETE
                    schema: "public",
                    table: "teams",
                },
                (payload: any) => {
                    try {
                        if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
                            if (payload.new) {
                                // Map database fields to Redux model
                                const team = {
                                    team_id: payload.new.team_id,
                                    team_name: payload.new.team_name,
                                    team_size: payload.new.team_size ?? 0,
                                    is_approved: payload.new.is_approved ?? false,
                                };
                                dispatch(upsertAdminTeam(team));
                                console.log("[Realtime] Teams updated:", payload.eventType, team.team_id);
                            }
                        } else if (payload.eventType === "DELETE") {
                            if (payload.old) {
                                dispatch(removeAdminTeam(payload.old.team_id));
                                console.log("[Realtime] Team removed:", payload.old.team_id);
                            }
                        }
                    } catch (error) {
                        console.error("[Realtime] Teams event error:", error);
                    }
                }
            )
            .subscribe((status) => {
                if (status === "SUBSCRIBED") {
                    console.log("[Realtime] Subscribed to teams");
                } else if (status === "CHANNEL_ERROR") {
                    console.error("[Realtime] Teams channel error");
                } else if (status === "CLOSED") {
                    console.warn("[Realtime] Teams channel closed");
                }
            });

        subscriptionsRef.current.set("teams", channel);
    }

    /**
     * Optional: Subscribe to rounds table
     * Not currently enabled - uncomment if needed
     * 
     * Events: UPDATE
     * Behavior:
     * - UPDATE → dispatch upsertAdminGame if is_active changed
     */
    // function subscribeToRounds() {
    //   const channel = supabase
    //     .channel("realtime:rounds")
    //     .on(
    //       "postgres_changes",
    //       {
    //         event: "UPDATE",
    //         schema: "public",
    //         table: "rounds",
    //       },
    //       (payload: any) => {
    //         try {
    //           if (payload.new && payload.new.is_active !== payload.old?.is_active) {
    //             // is_active changed - update games slice
    //             const game = {
    //               id: payload.new.game_id,
    //               is_active: payload.new.is_active,
    //             };
    //             dispatch(upsertAdminGame(game));
    //             console.log("[Realtime] Round activity changed:", payload.new.id);
    //           }
    //         } catch (error) {
    //           console.error("[Realtime] Rounds event error:", error);
    //         }
    //       }
    //     )
    //     .subscribe((status) => {
    //       if (status === "SUBSCRIBED") {
    //         console.log("[Realtime] Subscribed to rounds");
    //       }
    //     });

    //   subscriptionsRef.current.set("rounds", channel);
    // }
}
