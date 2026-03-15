import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

type User = {
  id: string;
  name: string;
  role: "team" | "admin";
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
    },
    clearUser(state) {
      state.user = null;
      state.status = "unauthenticated";
    },
    forceLogout(state) {
      state.user = null;
      state.status = "unauthenticated";
      state.forcedLogout = true;
    },
    resetForcedLogout(state) {
      state.forcedLogout = false;
    },
    setHydrated(state) {
      state.hydrated = true;
    },
  },
});

export const { setUser, clearUser, forceLogout, resetForcedLogout, setHydrated } = authSlice.actions;
export default authSlice.reducer;