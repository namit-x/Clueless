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

  useEffect(() => {
    // Hydrate auth on mount
    dispatch(hydrateFromStorage());

    // Only fetch if not already loaded
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
    return <div>Loading dashboard...</div>;
  }

  if (teamBlocked) return <TeamBlockedScreen />;

  return (
    <div className="p-6 bg-gray-950 min-h-screen">
      <DashboardHeader teamName={user?.name ?? ""} />
      <GamesGrid games={games} />
    </div>
  );
}