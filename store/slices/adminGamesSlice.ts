import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { AdminGame } from "@/lib/types/adminGames";

type AdminGamesState = {
  items: AdminGame[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  actionStatusById: Record<string, "idle" | "loading">;
  lastFetchRequestId: number; // Track request order to prevent race conditions
};

let fetchRequestCounter = 0; // Global counter for request IDs

const initialState: AdminGamesState = {
  items: [],
  status: "idle",
  error: null,
  actionStatusById: {},
  lastFetchRequestId: 0,
};

export const fetchAdminGamesThunk = createAsyncThunk(
  "adminGames/fetch",
  async (_, { rejectWithValue }) => {
    const requestId = ++fetchRequestCounter;

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

    return { mapped, requestId };
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
  reducers: {
    // Direct upsert for realtime updates
    upsertAdminGame: (state, action) => {
      const index = state.items.findIndex((g) => g.id === action.payload.id);
      if (index >= 0) {
        state.items[index] = action.payload;
      } else {
        state.items.push(action.payload);
      }
    },
    // Direct delete for realtime updates
    removeAdminGame: (state, action) => {
      state.items = state.items.filter((g) => g.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminGamesThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAdminGamesThunk.fulfilled, (state, action) => {
        // Only accept this response if it's from the latest request
        if (action.payload.requestId >= state.lastFetchRequestId) {
          state.status = "succeeded";
          state.items = action.payload.mapped;
          state.lastFetchRequestId = action.payload.requestId;
        }
      })
      .addCase(fetchAdminGamesThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { upsertAdminGame, removeAdminGame } = adminGamesSlice.actions;
export default adminGamesSlice.reducer;