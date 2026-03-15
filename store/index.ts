import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import teamReducer from "./slices/teamSlice";
import gamesReducer from "./slices/gamesSlice";
import adminGamesReducer from "./slices/adminGamesSlice";
import adminTeamsReducer from "./slices/adminTeamsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    team: teamReducer,
    games: gamesReducer,
    adminGames: adminGamesReducer,
    adminTeams: adminTeamsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;