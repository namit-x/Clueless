"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { supabase } from "@/lib/supabase/client";

/**
 * Subscribes to Supabase Realtime on the sessions table for monitoring.
 * Does NOT trigger automatic logout — only the explicit logout button does that.
 */
export function useSessionRealtime() {
    const user = useAppSelector((state) => state.auth.user);

    useEffect(() => {
        if (!user?.id || !user?.sessionId) return;

        const ownerType = user.role;
        const ownerId = user.id;

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
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };

    }, [user?.id, user?.sessionId, user?.role]);
}
