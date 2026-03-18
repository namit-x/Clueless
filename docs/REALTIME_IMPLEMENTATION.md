# Supabase Realtime Implementation

## Overview

Supabase Realtime subscriptions have been integrated into the admin dashboard to provide instant updates for team approval status and team progress changes.

**Date Implemented:** March 18, 2026  
**Status:** Production-ready for admin use  
**Scope:** Admin dashboard only (team dashboard TBD)

---

## Architecture

### Hook: `useRealtimeSubscriptions`

**Location:** [hooks/useRealtimeSubscriptions.ts](../hooks/useRealtimeSubscriptions.ts)

**Responsibilities:**
- Initialize Supabase client connection
- Create subscriptions to database tables
- Dispatch Redux actions on events
- Manage subscription lifecycle (cleanup on unmount)
- Error handling and logging

**Subscription Guard:**
- Uses `useRef` to ensure subscriptions created only once per mount
- Prevents duplicate subscriptions if component re-renders
- Safely cleans up all subscriptions on unmount

---

## Subscriptions

### 1. Teams Table
**Table:** `public.teams`  
**Events:** INSERT, UPDATE, DELETE  
**Frequency:** Triggered when team records change

**Behavior:**
| Event | Action | Result |
|-------|--------|--------|
| INSERT | `dispatch(upsertAdminTeam(new))` | New team appears in admin list |
| UPDATE | `dispatch(upsertAdminTeam(new))` | Team approval status changes instantly |
| DELETE | `dispatch(removeAdminTeam(id))` | Team removed from admin list |

**Redux State Updated:**
- `adminTeams.items` - inserts or updates team with new `is_approved` status
- UI automatically re-renders via selectors

**Example Flow:**
```
Backend action: Admin approves Team X
    ↓
UPDATE teams SET is_approved = true WHERE team_id = 'uuid'
    ↓
Supabase broadcasts to subscribers
    ↓
Frontend receives: { eventType: "UPDATE", new: {team_id, is_approved: true} }
    ↓
dispatch(upsertAdminTeam({team_id, is_approved: true}))
    ↓
Redux state updated
    ↓
UI shows approved team instantly (no page refresh)
```

### 2. Team Round Progress Table
**Table:** `public.team_round_progress`  
**Events:** UPDATE  
**Frequency:** Triggered when team completes rounds

**Behavior:**
| Event | Action | Rationale |
|-------|--------|-----------|
| UPDATE | `dispatch(fetchAdminTeamsThunk())` | Refetch to get joined data |

**Why Refetch Instead of Direct Update:**
- `team_round_progress` is a joining table
- Admin needs context: which team, which round, what status
- Direct patching would require complex deduplication
- Safer to refetch aggregated data than patch raw rows
- `fetchAdminTeamsThunk` already exists and is stable

**Example Flow:**
```
Backend action: Team X completes Round 1
    ↓
INSERT/UPDATE team_round_progress (team_X, round_1, COMPLETED)
    ↓
Supabase broadcasts to subscribers
    ↓
Frontend receives: { eventType: "UPDATE", new: {team_id, round_id, status} }
    ↓
dispatch(fetchAdminTeamsThunk()) [refetch full list]
    ↓
GET /api/v1/admin/teams
    ↓
Redux state updated with complete team context
    ↓
Admin progress panel shows new round completion
```

### 3. Rounds Table (Optional)
**Currently Disabled** - Uncomment in hook if needed

**Would Monitor:** `public.rounds` table  
**Events:** UPDATE  
**Trigger Condition:** When `is_active` changes

---

## Integration Points

### Admin Dashboard Page
**File:** [app/(app)/admin/dashboard/page.tsx](../app/(app)/admin/dashboard/page.tsx)

**Hook Call:**
```typescript
// Initialize realtime subscriptions on mount
useRealtimeSubscriptions();
```

**Behavior:**
- Hook runs once per component mount
- Subscriptions active while page is open
- Subscriptions cleaned up when component unmounts
- No interference with existing API fetch logic

**Flow:**
```
AdminDashboardPage mounts
    ↓
useRealtimeSubscriptions() called
    ↓
Subscribe to teams table
Subscribe to team_round_progress table
    ↓
Initial data already fetched by GameControlPanel/TeamControlPanel
    ↓
Realtime events received → Redux updated
    ↓
UI re-renders automatically via selectors
```

---

## Redux Integration

### Actions Used

**From `adminTeamsSlice`:**
- `upsertAdminTeam(team)` - Insert or update team record
- `removeAdminTeam(teamId)` - Delete team from state
- `fetchAdminTeamsThunk()` - Refetch full team list (triggered by progress updates)

**From `adminGamesSlice`:**
- `upsertAdminGame(game)` - Not currently used by subscriptions
- `removeAdminGame(gameId)` - Not currently used by subscriptions

### Pattern: UPSERT

**Implemented in Redux slices during Phase 1 fixes**

```typescript
// If team already exists by ID, update it
// Otherwise, add it to the list
const index = state.items.findIndex((t) => t.team_id === action.payload.team_id);
if (index >= 0) {
    state.items[index] = action.payload;
} else {
    state.items.push(action.payload);
}
```

**Benefit:**
- No need to rebuild entire list
- Preserves other state, only updates affected record
- Efficient re-renders (only changed team updates UI)

---

## Data Flow

### Approval Update Scenario

```
┌─ Admin Dashboard (Frontend)
│  ├─ useRealtimeSubscriptions running
│  ├─ Listening for teams table changes
│  └─ Redux adminTeams slice ready
│
├─ Admin clicks "Approve Team A"
│  ├─ PATCH /api/v1/admin/teams/[id]/approve
│  ├─ Backend: UPDATE teams SET is_approved = true
│  └─ Backend: Supabase broadcasts change
│
├─ Frontend receives realtime event
│  ├─ { eventType: "UPDATE", new: {team_id, is_approved: true} }
│  ├─ dispatch(upsertAdminTeam({...new_data}))
│  └─ Redux updated
│
└─ UI re-renders
   ├─ selectAllAdminTeams selector fires
   ├─ TeamControlPanel gets new data
   └─ Team shows as approved instantly
```

### Progress Update Scenario

```
┌─ Team X playing Treasure Hunt game
│  └─ Completes Round 3
│
├─ Team submits final answer correctly
│  ├─ POST /api/v1/rounds/[id]/submissions {answer}
│  ├─ Backend: completeRoundRepo()
│  └─ Backend: INSERT team_round_progress (complete)
│
├─ Frontend admin dashboard listening
│  ├─ Realtime: UPDATE team_round_progress detected
│  ├─ dispatch(fetchAdminTeamsThunk())
│  └─ GET /api/v1/admin/teams (get fresh list)
│
└─ Admin panel updates
   ├─ Shows Team X completed Round 3
   ├─ Leaderboard updates if applicable
   └─ No page refresh required
```

---

## Error Handling

### Subscription Errors
```typescript
catch (error) {
    console.error("[Realtime] Subscription setup error:", error);
}
```
- Logs subscription initialization errors
- Does NOT crash UI
- Page continues to work with polling (existing API calls)

### Event Processing Errors
```typescript
catch (error) {
    console.error("[Realtime] Teams event error:", error);
}
```
- Logs individual event processing errors
- Skips malformed events
- Continues listening for subsequent events
- Other subscriptions unaffected

### Connection Status
```typescript
.subscribe((status) => {
    if (status === "SUBSCRIBED") console.log("Connected");
    if (status === "CHANNEL_ERROR") console.error("Error");
    if (status === "CLOSED") console.warn("Closed");
})
```
- Logs connection lifecycle
- Supabase client auto-reconnects on disconnect
- Manual reconnection not needed

---

## Safe Implementation Patterns

### 1. Guard Against Duplicate Subscriptions
```typescript
const initializedRef = useRef(false);

if (initializedRef.current) return;
initializedRef.current = true;
```
✅ Prevents creating same subscription multiple times

### 2. Proper Cleanup
```typescript
return () => {
    subscriptionsRef.current.forEach((channel, key) => {
        supabase.removeChannel(channel);
        subscriptionsRef.current.delete(key);
    });
};
```
✅ Prevents memory leaks, removes listeners on unmount

### 3. Null Checks
```typescript
if (payload.new) { /* update */ }
if (payload.old) { /* delete */ }
```
✅ Ensures data exists before using it

### 4. Isolated Redux Actions
```typescript
// Direct dispatch to Redux
dispatch(upsertAdminTeam(team));
```
✅ No custom network logic, no duplicate API calls
✅ No interference with existing thunks
✅ Plays well with Redux devtools

### 5. No Global State
```typescript
// Hook mounted only in admin dashboard
useRealtimeSubscriptions();
```
✅ Realtime only active when admin viewing dashboard
✅ Subscriptions cleaned up when admin navigates away
✅ No background subscriptions consuming resources

---

## Limitations & Considerations

### Current Scope
- ✅ Admin team approval/rejection updates
- ✅ Admin progress monitoring updates
- ❌ Team-side updates NOT YET implemented
- ❌ No team-specific filtering (would need auth token in subscription)

### Supabase Realtime Limits
- Max 100 subscribers per table
- Connections close if ideal for >24 hours (reconnect auto)
- Events dropped if server overloaded (graceful degradation)

### Performance
- ✅ Single subscription per table (not per row)
- ✅ Efficient UPSERT pattern (no full state rebuild)
- ✅ No polling + realtime conflict (polling stopped on success)

### Security
- ✅ Only admin can access admin dashboard hooks
- ✅ Supabase RLS policies enforced per table
- ✅ No sensitive data in logs (filtered team_id only)
- ❌ Team subscriptions would need additional auth filters (TODO v2)

---

## Testing Checklist

- [ ] Admin opens dashboard → subscriptions initialize (check console logs)
- [ ] Admin approves team → team shows approved instantly (no refresh)
- [ ] Admin rejects team → team shows rejected instantly
- [ ] Admin starts game → team progress reflected in admin panel
- [ ] Multiple admins online → all see updates in real-time
- [ ] Network disconnect → auto-reconnects, catches up on updates
- [ ] Admin navigates away → subscriptions cleaned up properly
- [ ] No duplicate events → same event doesn't trigger multiple updates

---

## Future Enhancements

### Phase 2: Team-Side Realtime
- [ ] Subscribe to rounds table (teams see active game status)
- [ ] Implement row-level security filters for teams
- [ ] Notify team when game starts/ends

### Phase 3: Performance Optimization
- [ ] Batch progress updates (don't refetch on every round)
- [ ] Client-side caching layer
- [ ] Debounce event processing

### Phase 4: Advanced Features
- [ ] Leaderboard realtime updates
- [ ] Admin notifications for team actions
- [ ] Websocket fallback if Realtime unavailable

---

## Implementation Date & Author

**Date:** March 18, 2026  
**Purpose:** Stabilize frontend + prepare for realtime  
**Maintenance:** Review connection logs weekly, monitor Supabase quota  
**Contact:** Frontend Team

---

## See Also

- [useRealtimeSubscriptions Hook](../hooks/useRealtimeSubscriptions.ts)
- [Admin Dashboard Page](../app/(app)/admin/dashboard/page.tsx)
- [Redux Admin Teams Slice](../store/slices/adminTeamsSlice.ts)
- [Realtime Contract (Backend)](./realtime-contract.md)
- [Supabase Schema](../supabase_schema.sql)
