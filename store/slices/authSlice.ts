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

function isValidStoredUser(value: unknown): value is User {
  if (!value || typeof value !== "object") {
    return false;
  }

  const user = value as Record<string, unknown>;

  return (
    typeof user.id === "string" &&
    user.id.trim().length > 0 &&
    typeof user.name === "string" &&
    typeof user.role === "string" &&
    (user.role === "team" || user.role === "admin") &&
    typeof user.sessionId === "string" &&
    user.sessionId.trim().length > 0
  );
}

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
      if (!action.payload.sessionId?.trim()) {
        state.user = null;
        state.status = "unauthenticated";
        localStorage.removeItem("user");
        return;
      }

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
          const parsedUser = JSON.parse(userStr);

          if (isValidStoredUser(parsedUser)) {
            state.user = parsedUser;
            state.status = "authenticated";
          } else {
            state.user = null;
            state.status = "unauthenticated";
            localStorage.removeItem("user");
          }
        } else {
          state.user = null;
          state.status = "unauthenticated";
        }
      } catch {
        state.user = null;
        state.status = "unauthenticated";
        localStorage.removeItem("user");
      }
      state.hydrated = true;
    },
  },
});

export const { setUser, clearUser, forceLogout, resetForcedLogout, setHydrated, hydrateFromStorage } = authSlice.actions;

export default authSlice.reducer;
