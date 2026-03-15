import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

type Game = {
  id: string;
  name: string;
  order_index: number;
  status: "NOT_STARTED" | "LIVE" | "PAUSED" | "ENDED";
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
  reducers: {},
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

export default gamesSlice.reducer;