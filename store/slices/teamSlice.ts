import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

type TeamSummary = {
  is_active: boolean;
  penalty_time_seconds?: number;
};

type TeamState = {
  summary: TeamSummary | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: TeamState = {
  summary: null,
  status: "idle",
  error: null,
};

export const fetchTeamDashboardThunk = createAsyncThunk(
  "team/fetchDashboard",
  async (_, { rejectWithValue }) => {
    const res = await fetch("/api/team/dashboard", {
      credentials: "include",
    });

    if (res.status === 401 || res.status === 403) {
      return rejectWithValue("unauthorized");
    }

    const json = await res.json();

    if (!json?.team) {
      return rejectWithValue("unauthorized");
    }

    return json.team as TeamSummary;
  }
);

const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeamDashboardThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTeamDashboardThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.summary = action.payload;
      })
      .addCase(fetchTeamDashboardThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default teamSlice.reducer;