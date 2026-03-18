import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

type Team = {
    team_id: string;
    team_name: string;
    team_size: number;
    is_approved: boolean;
};

type AdminTeamsState = {
    items: Team[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
    actionStatusById: Record<string, "idle" | "loading:approve" | "loading:reject">;
};

const initialState: AdminTeamsState = {
    items: [],
    status: "idle",
    error: null,
    actionStatusById: {},
};

export const fetchAdminTeamsThunk = createAsyncThunk(
    "adminTeams/fetch",
    async (_, { rejectWithValue }) => {
        const res = await fetch("/api/v1/admin/teams", {
            credentials: "include",
        });
        const data = await res.json();
        return data.teams as Team[];
    }
);

export const approveTeamThunk = createAsyncThunk(
    "adminTeams/approve",
    async (teamId: string, { dispatch }) => {
        await fetch(`/api/v1/admin/teams/${teamId}/approve`, {
            method: "PATCH",
            credentials: "include",
        });
        dispatch(fetchAdminTeamsThunk());
        return teamId;
    }
);

export const rejectTeamThunk = createAsyncThunk(
    "adminTeams/reject",
    async (teamId: string, { dispatch }) => {
        await fetch(`/api/v1/admin/teams/${teamId}/reject`, {
            method: "PATCH",
            credentials: "include",
        });
        dispatch(fetchAdminTeamsThunk());
        return teamId;
    }
);
const adminTeamsSlice = createSlice({
    name: "adminTeams",
    initialState,
    reducers: {
        // Direct upsert for realtime updates
        upsertAdminTeam: (state, action) => {
            const index = state.items.findIndex((t) => t.team_id === action.payload.team_id);
            if (index >= 0) {
                state.items[index] = action.payload;
            } else {
                state.items.push(action.payload);
            }
        },
        // Direct delete for realtime updates
        removeAdminTeam: (state, action) => {
            state.items = state.items.filter((t) => t.team_id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminTeamsThunk.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchAdminTeamsThunk.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload;
            })
            .addCase(fetchAdminTeamsThunk.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            })
            // approve
            .addCase(approveTeamThunk.pending, (state, action) => {
                state.actionStatusById[action.meta.arg] = "loading:approve";
                // Do NOT update is_approved here - wait for refetch
            })
            // reject
            .addCase(rejectTeamThunk.pending, (state, action) => {
                state.actionStatusById[action.meta.arg] = "loading:reject";
                // Do NOT update is_approved here - wait for refetch
            })
            .addCase(approveTeamThunk.fulfilled, (state, action) => {
                delete state.actionStatusById[action.payload];
                // State will be updated by refetch dispatch
            })
            .addCase(approveTeamThunk.rejected, (state, action) => {
                delete state.actionStatusById[action.meta.arg];
                // State remains unchanged (from last successful fetch)
            })
            .addCase(rejectTeamThunk.fulfilled, (state, action) => {
                delete state.actionStatusById[action.payload];
                // State will be updated by refetch dispatch
            })
            .addCase(rejectTeamThunk.rejected, (state, action) => {
                delete state.actionStatusById[action.meta.arg];
                // State remains unchanged (from last successful fetch)
            })
    },
});

export const { upsertAdminTeam, removeAdminTeam } = adminTeamsSlice.actions;
export default adminTeamsSlice.reducer;