import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

type Game = {
  id: string;
  name: string;
  order_index: number;
  is_active: boolean; // Changed from status to isActive (boolean)
  state: "NOT_STARTED" | "LIVE" | "ENDED";
};

type GamesState = {
  items: Game[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: GamesState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchGamesThunk = createAsyncThunk(
  "games/fetchGames",
  async (_, { rejectWithValue }) => {
    const res = await fetch("/api/game/current", {
      credentials: "include",
    });

    if (res.status === 401 || res.status === 403) {
      return rejectWithValue("unauthorized");
    }

    const json = await res.json();

    if (!json?.success || !Array.isArray(json.game)) {
      return rejectWithValue("invalid response");
    }

    return json.game as Game[];
  }
);

const gamesSlice = createSlice({
  name: "games",
  initialState,
  reducers: {
    // Direct upsert for realtime updates
    upsertGame: (state, action) => {
      const index = state.items.findIndex((g) => g.id === action.payload.id);
      if (index >= 0) {
        state.items[index] = action.payload;
      } else {
        state.items.push(action.payload);
      }
    },
    // Direct delete for realtime updates
    removeGame: (state, action) => {
      state.items = state.items.filter((g) => g.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGamesThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchGamesThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchGamesThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { upsertGame, removeGame } = gamesSlice.actions;
export default gamesSlice.reducer;