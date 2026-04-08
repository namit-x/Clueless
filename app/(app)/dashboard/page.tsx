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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="relative flex flex-col items-center gap-6">
        {/* Spinner Rings */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-white/[0.06]" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          <div
            className="absolute inset-2 rounded-full border-2 border-transparent border-b-secondary animate-spin"
            style={{
              animationDirection: "reverse",
              animationDuration: "0.7s",
            }}
          />
        </div>

        {/* Animated Entering Text */}
        <div className="flex gap-1 text-sm md:text-base font-semibold uppercase tracking-[0.25em]">
          {"Entering GameArena".split("").map((char, i) => (
            <span
              key={i}
              className="animate-pulse"
              style={{
                animationDelay: `${i * 0.08}s`,
                opacity: 0.25,
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </div>
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