import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { AdminGame } from "@/lib/types/adminGames";

type AdminGamesState = {
  items: AdminGame[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  actionStatusById: Record<string, "idle" | "loading">;
};

const initialState: AdminGamesState = {
  items: [],
  status: "idle",
  error: null,
  actionStatusById: {},
};

export const fetchAdminGamesThunk = createAsyncThunk(
  "adminGames/fetch",
  async (_, { rejectWithValue }) => {
    const res = await fetch("/api/v1/admin/games", {
      credentials: "include",
    });
    const json = await res.json();

    const mapped: AdminGame[] = (json.games || []).map((g: any) => ({
      ...g,
      status:
        g.status === "NOT_STARTED"
          ? "pending"
          : g.status === "LIVE"
          ? "running"
          : "ended",
    }));

    return mapped;
  }
);

async function gameAction(id: string, action: string) {
  await fetch(`/api/v1/admin/games/${id}/${action}`, {
    method: "PATCH",
    credentials: "include",
  });
}

export const startAdminGameThunk = createAsyncThunk(
  "adminGames/start",
  async (id: string, { dispatch }) => {
    await gameAction(id, "start");
    dispatch(fetchAdminGamesThunk());
  }
);

export const endAdminGameThunk = createAsyncThunk(
  "adminGames/end",
  async (id: string, { dispatch }) => {
    await gameAction(id, "end");
    dispatch(fetchAdminGamesThunk());
  }
);

export const restartAdminGameThunk = createAsyncThunk(
  "adminGames/restart",
  async (id: string, { dispatch }) => {
    await gameAction(id, "restart");
    dispatch(fetchAdminGamesThunk());
  }
);

const adminGamesSlice = createSlice({
  name: "adminGames",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminGamesThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAdminGamesThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchAdminGamesThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default adminGamesSlice.reducer;