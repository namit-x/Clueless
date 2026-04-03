import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

type User = {
  id: string;
  name: string;
  role: "team" | "admin";
  sessionId?: string;
};

type AuthState = {
  user: User | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  error: string | null;
  forcedLogout: boolean;
  hydrated: boolean;
};

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
  forcedLogout: false,
  hydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.status = "authenticated";
      // Save to localStorage for persistence
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    clearUser(state) {
      state.user = null;
      state.status = "unauthenticated";
      // Remove from localStorage
      localStorage.removeItem("user");
    },
    forceLogout(state) {
      state.user = null;
      state.status = "unauthenticated";
      state.forcedLogout = true;
      // Remove from localStorage
      localStorage.removeItem("user");
    },
    resetForcedLogout(state) {
      state.forcedLogout = false;
    },
    setHydrated(state) {
      state.hydrated = true;
    },
    hydrateFromStorage(state) {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          state.user = JSON.parse(userStr);
          state.status = "authenticated";
        } else {
          state.status = "unauthenticated";
        }
      } catch {
        state.status = "unauthenticated";
      }
      state.hydrated = true;
    },
  },
});

export const { setUser, clearUser, forceLogout, resetForcedLogout, setHydrated, hydrateFromStorage } = authSlice.actions;

export default authSlice.reducer;