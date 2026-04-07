"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTeamDashboardThunk } from "@/store/slices/teamSlice";
import { fetchGamesThunk } from "@/store/slices/gamesSlice";
import { selectTeamBlocked, selectTeamStatus, selectDashboardGames, selectGamesStatus } from "@/store/selectors/gameSelectors";
import { hydrateFromStorage } from "@/store/slices/authSlice";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import GamesGrid from "@/components/dashboard/GameGrid";
import TeamBlockedScreen from "@/components/game/TeamBlockedScreen";
import { useTeamRealtimeSubscriptions } from "@/hooks/useTeamRealtimeSubscriptions";

/**
 * Renders the team dashboard page, hydrates authentication on mount, subscribes to realtime team updates, and fetches team and games data when needed.
 *
 * When either data slice is loading, displays a full-screen loading indicator; if the team is blocked, displays the TeamBlockedScreen; otherwise renders the DashboardHeader and GamesGrid with the current user and games.
 *
 * @returns The dashboard UI element described above.
 */
export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Realtime: update game list when admin starts / ends a game
  useTeamRealtimeSubscriptions();

  const teamBlocked = useAppSelector(selectTeamBlocked);
  const teamStatus = useAppSelector(selectTeamStatus);
  const gamesStatus = useAppSelector(selectGamesStatus);
  const games = useAppSelector(selectDashboardGames);
  const user = useAppSelector((state) => state.auth.user);

  // Hydrate auth once on mount
  useEffect(() => {
    dispatch(hydrateFromStorage());
  }, [dispatch]);

  // Fetch data when status is idle
  useEffect(() => {
    if (teamStatus === "idle") {
      dispatch(fetchTeamDashboardThunk()).then((result) => {
        if (result.payload === "unauthorized") {
          alert("Your session expired. Please login again.");
          router.replace("/login");
        }
      });
    }

    if (gamesStatus === "idle") {
      dispatch(fetchGamesThunk()).then((result) => {
        if (result.payload === "unauthorized") {
          alert("Your session expired. Please login again.");
          router.replace("/login");
        }
      });
    }
  }, [dispatch, router, teamStatus, gamesStatus]);

  if (teamStatus === "loading" || gamesStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative flex flex-col items-center gap-5">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-2 border-white/[0.06]" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" style={{ animationDuration: "1s" }} />
            <div
              className="absolute inset-2 rounded-full border-2 border-transparent border-b-secondary animate-spin"
              style={{ animationDirection: "reverse", animationDuration: "0.7s" }}
            />
          </div>
          <p className="text-sm tracking-[0.2em] uppercase text-white/30 animate-pulse">
            Loading dashboard
          </p>
        </div>
      </div>
    );
  }

  if (teamBlocked) return <TeamBlockedScreen />;

  return (
    <div className="min-h-screen relative">
      {/* Content */}
      <div className="w-full px-6 lg:px-10 xl:px-16 2xl:px-24 py-8 sm:py-10 animate-fade-in">
        <DashboardHeader teamName={user?.name ?? ""} />

        <div className="mt-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <GamesGrid games={games} />
        </div>
      </div>
    </div>
  );
}