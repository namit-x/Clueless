"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTeamDashboardThunk } from "@/store/slices/teamSlice";
import { fetchGamesThunk } from "@/store/slices/gamesSlice";
import { selectTeamBlocked, selectTeamStatus, selectDashboardGames } from "@/store/selectors/gameSelectors";
import { hydrateFromStorage } from "@/store/slices/authSlice";  // Add this import
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import GamesGrid from "@/components/dashboard/GameGrid";
import TeamBlockedScreen from "@/components/game/TeamBlockedScreen";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const teamBlocked = useAppSelector(selectTeamBlocked);
  const teamStatus = useAppSelector(selectTeamStatus);
  const games = useAppSelector(selectDashboardGames);
  const user = useAppSelector((state) => state.auth.user);
  console.log("Games", games);

  useEffect(() => {
    dispatch(hydrateFromStorage());  // Add this: Load user from localStorage on mount

    dispatch(fetchTeamDashboardThunk()).then((result) => {
      if (result.payload === "unauthorized") {
        alert("Your session expired. Please login again.");
        router.replace("/login");
      }
    });

    dispatch(fetchGamesThunk()).then((result) => {
      if (result.payload === "unauthorized") {
        alert("Your session expired. Please login again.");
        router.replace("/login");
      }
    });
  }, [dispatch, router]);

  if (teamStatus === "loading" || teamStatus === "idle") {
    return <div>Loading dashboard...</div>;
  }

  if (teamBlocked) return <TeamBlockedScreen />;

  return (
    <div className="p-6">
      <DashboardHeader teamName={user?.name ?? ""} />
      <GamesGrid games={games} />
    </div>
  );
}