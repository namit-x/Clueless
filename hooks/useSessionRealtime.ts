"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { forceLogout } from "@/store/slices/authSlice";
import { supabase } from "@/lib/supabase/client";

const POLL_INTERVAL_MS = 15_000;

/**

* Subscribes to Supabase Realtime on the sessions table.
* On any change, verifies the current session still exists in DB.
* Falls back to periodic polling in case realtime events are missed.
* Forces logout if session was replaced or deleted.
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
           const { data, error } = await supabase
               .from("sessions")
               .select("session_id")
               .eq("owner_type", ownerType)
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

   // Polling fallback
   const interval = setInterval(verifySession, POLL_INTERVAL_MS);

   const channel = supabase
       .channel(`session:${ ownerType }:${ ownerId } `)
       .on(
           "postgres_changes",
           {
               event: "INSERT",
               schema: "public",
               table: "sessions",
               filter: `owner_id=eq.${ownerId}`,
           },
           (payload) => {
               const row = payload.new;

               // 🔥 critical: prevent cross-owner leakage
               if (row.owner_type !== ownerType) return;

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
               const row = payload.new;

               // 🔥 critical: prevent cross-owner leakage
               if (row.owner_type !== ownerType) return;

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
       isActive = false;
       clearInterval(interval);
       supabase.removeChannel(channel);
   };

    }, [user?.id, user?.sessionId, user?.role, dispatch]);
}
