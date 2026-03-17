# Supabase Realtime Contract Document

**Last Updated:** March 17, 2026  
**System:** Clueless Event Platform  
**Purpose:** Single source of truth for Supabase realtime event subscriptions

---

## 1. TABLE CONTRACTS

### 1.1 `teams` Table

**Primary Key:** `team_id` (UUID)

**Realtime-Relevant Columns:**

| Column | Type | Description | Allowed Values | Nullable |
|--------|------|-------------|-----------------|----------|
| `team_id` | UUID | Unique team identifier | N/A | NO |
| `team_name` | TEXT | Team display name | Any string | NO |
| `team_size` | INTEGER | Number of team members | 1-10 | NO |
| `is_approved` | BOOLEAN | Admin approval status | true / false | NO |
| `owner_id` | UUID | Team creator user ID | UUID | YES |

**Foreign Keys:**
- None (owner_id is reference to auth system, not bound here)

**Unique Constraints:**
- `team_name` (UNIQUE)

**Notes:**
- Only approved teams (`is_approved = true`) participate in games
- Realtime updates are primarily for `is_approved` field changes
- Admin subscriptions receive ALL team changes (no filtering)

---

### 1.2 `rounds` Table

**Primary Key:** `id` (UUID)

**Realtime-Relevant Columns:**

| Column | Type | Description | Allowed Values | Nullable |
|--------|------|-------------|-----------------|----------|
| `id` | UUID | Unique round identifier | N/A | NO |
| `game_id` | UUID | Foreign key to games | UUID of active game | NO |
| `round_number` | INTEGER | 1-based round sequence | 1-N | NO |
| `title` | TEXT | Round display title | Any string | YES |
| `configuration` | JSONB | Game logic & rules | Valid JSON | NO |
| `is_active` | BOOLEAN | Round operational status | true / false | NO |
| `created_at` | TIMESTAMP | Creation timestamp | UNIX timestamp | NO |

**Foreign Keys:**
- `game_id` references `games.id` (ON DELETE CASCADE)

**Unique Constraints:**
- `UNIQUE(game_id, round_number)`

**Notes:**
- Rounds belong to exactly ONE game (enforced by FK)
- Multiple games can have Round 1, Round 2, etc. (differentiated by game_id)
- Realtime updates typically for `is_active` status changes (rare)
- When filtering, ALWAYS use with `game_id` filter to prevent cross-game contamination

---

### 1.3 `team_round_progress` Table

**Primary Key:** `id` (UUID)  
**Composite Unique Key:** `UNIQUE(team_id, round_id)`

**Realtime-Relevant Columns:**

| Column | Type | Description | Allowed Values | Nullable | Updates |
|--------|------|-------------|-----------------|----------|---------|
| `id` | UUID | Internal row identifier | N/A | NO | NO |
| `team_id` | UUID | Foreign key to teams | UUID | NO | NO |
| `round_id` | UUID | Foreign key to rounds | UUID | NO | NO |
| `status` | TEXT | Team's progress state | LOCKED, ACTIVE, COMPLETED, FAILED | NO | **YES** |
| `attempt_count` | INTEGER | Wrong submission count | 0-N | NO | **YES** |
| `started_at` | TIMESTAMP | Round start time | UNIX timestamp | YES | YES |
| `completed_at` | TIMESTAMP | Round completion time | UNIX timestamp | YES | YES |
| `failed_at` | TIMESTAMP | Round failure time | UNIX timestamp | YES | YES |

**Foreign Keys:**
- `team_id` references `teams.team_id` (ON DELETE CASCADE)
- `round_id` references `rounds.id` (ON DELETE CASCADE)

**Unique Constraints:**
- `UNIQUE(team_id, round_id)` - Enforces one record per team per round
- `PRIMARY KEY (id)` - Auto-indexed row identifier

**Status Value Definitions:**

| Status | Meaning | Transition Rules |
|--------|---------|------------------|
| `LOCKED` | Team cannot access this round yet | → ACTIVE |
| `ACTIVE` | Team currently working on round | → COMPLETED or FAILED |
| `COMPLETED` | Team correctly answered; round finished | Terminal state |
| `FAILED` | Team exceeded max attempts; round finished | Terminal state |

**UPDATE Events Expected:**
- `status`: LOCKED → ACTIVE (round start), ACTIVE → COMPLETED (correct answer), ACTIVE → FAILED (max attempts)
- `attempt_count`: Increments on each wrong submission (ACTIVE state only)
- `started_at`: Set when status becomes ACTIVE
- `completed_at`: Set when status becomes COMPLETED
- `failed_at`: Set when status becomes FAILED

---

## 2. EVENT PAYLOAD STRUCTURE

### 2.1 Standard Realtime Event Format

All Supabase realtime events follow this structure:

```json
{
  "type": "REALTIME_SUBSCRIPTION",
  "event": "INSERT | UPDATE | DELETE",
  "schema": "public",
  "table": "teams | rounds | team_round_progress",
  "commit_timestamp": "2026-03-17T10:30:45Z",
  "eventId": "<UUID>",
  "new": { /* new record values */ },
  "old": { /* previous record values (UPDATE/DELETE only) */ }
}
```

### 2.2 Event Payload Examples

**Example 1: Team Approval (UPDATE)**

```json
{
  "type": "REALTIME_SUBSCRIPTION",
  "event": "UPDATE",
  "schema": "public",
  "table": "teams",
  "commit_timestamp": "2026-03-17T10:30:45Z",
  "new": {
    "team_id": "550e8400-e29b-41d4-a716-446655440000",
    "team_name": "TechVizards",
    "team_size": 4,
    "is_approved": true,
    "owner_id": "550e8400-e29b-41d4-a716-446655440001"
  },
  "old": {
    "team_id": "550e8400-e29b-41d4-a716-446655440000",
    "team_name": "TechVizards",
    "team_size": 4,
    "is_approved": false,
    "owner_id": "550e8400-e29b-41d4-a716-446655440001"
  }
}
```

**Example 2: Team Round Status Change (UPDATE)**

```json
{
  "type": "REALTIME_SUBSCRIPTION",
  "event": "UPDATE",
  "schema": "public",
  "table": "team_round_progress",
  "commit_timestamp": "2026-03-17T10:35:20Z",
  "new": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "team_id": "550e8400-e29b-41d4-a716-446655440000",
    "round_id": "770e8400-e29b-41d4-a716-446655440000",
    "status": "COMPLETED",
    "attempt_count": 2,
    "started_at": "2026-03-17T10:32:00Z",
    "completed_at": "2026-03-17T10:35:20Z",
    "failed_at": null
  },
  "old": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "team_id": "550e8400-e29b-41d4-a716-446655440000",
    "round_id": "770e8400-e29b-41d4-a716-446655440000",
    "status": "ACTIVE",
    "attempt_count": 2,
    "started_at": "2026-03-17T10:32:00Z",
    "completed_at": null,
    "failed_at": null
  }
}
```

---

## 3. FIELD NAME STANDARDIZATION

**CRITICAL: All frontend code MUST use these exact field names.**

### Canonical Field Names by Table

**teams:**
- `team_id` (NOT id, NOT team_identifier)
- `team_name` (NOT name)
- `team_size` (NOT size, NOT member_count)
- `is_approved` (NOT approved, NOT status)
- `owner_id` (NOT created_by)

**rounds:**
- `id` (NOT round_id, NOT identifier)
- `game_id` (NOT game, NOT gameId)
- `round_number` (NOT number, NOT sequence, NOT order)
- `title` (NOT name, NOT description)
- `configuration` (NOT config, NOT rules)
- `is_active` (NOT active, NOT status)
- `created_at` (NOT timestamp, NOT createdAt)

**team_round_progress:**
- `id` (NOT progress_id)
- `team_id` (NOT teamId — use snake_case)
- `round_id` (NOT roundId — use snake_case)
- `status` (NOT state, NOT progress_status)
- `attempt_count` (NOT attempts, NOT attempt, NOT wrong_count)
- `started_at` (NOT startTime, NOT start_timestamp)
- `completed_at` (NOT completionTime, NOT finished_at)
- `failed_at` (NOT failureTime, NOT failure_timestamp)

### Mapping Example (Frontend Destructuing)

```typescript
// ✅ CORRECT
const { team_id, team_name, is_approved } = teamsEvent.new;

// ❌ WRONG
const { id, name, approved } = teamsEvent.new;  // Will be undefined
```

---

## 4. EVENT → UI MAPPING

### 4.1 Admin Dashboard: Team Approval Updates

**Event Trigger:** `teams` table UPDATE on `is_approved` field

**Frontend Action:**
1. Listen for: `supabase.channel("admin:teams").on("UPDATE", ...)`
2. Check if: `payload.new.is_approved` changed from `old.is_approved`
3. Dispatch Redux: `updateAdminTeam(payload.new)` to update `adminTeamsSlice`
4. UI reflects: Team moves between "Active" and "Blocked" sections

**Example Implementation:**
```typescript
const event = payload.new;
if (event.is_approved !== payload.old.is_approved) {
  dispatch(updateAdminTeam({
    team_id: event.team_id,
    team_name: event.team_name,
    is_approved: event.is_approved
  }));
}
```

### 4.2 Admin Dashboard: Team Progress Updates

**Event Trigger:** `team_round_progress` table UPDATE on `status` or `attempt_count`

**Frontend Action:**
1. Listen for: `supabase.channel("admin:progress").on("UPDATE", ...)`
2. Trigger: Dispatch thunk to refetch `GET /api/v1/admin/teams-progress`
3. UI reflects: Team progress panel shows live round status, attempt counts

**Why Refetch (Not Patch)?**
- Safer: Ensures computed fields (percentages, stats) are recalculated
- Prevents: Redux state divergence if multiple events fire rapidly
- Consistent: Matches existing Admin Dashboard polling pattern

**Example Implementation:**
```typescript
supabase
  .channel("admin:progress")
  .on("UPDATE", { table: "team_round_progress" }, () => {
    dispatch(fetchAdminTeamsProgressThunk()); // Refetch endpoint
  })
  .subscribe();
```

### 4.3 Team Dashboard (Future): Personal Round Progress

**Event Trigger:** `team_round_progress` table UPDATE (filtered by team's `team_id`)

**Frontend Action:**
1. Listen for: `supabase.channel("team:" + teamId).on("UPDATE", ...)`
   - **CRITICAL FILTER:** `{ eq: { team_id: teamId } }`
2. Dispatch Redux: Update `game.currentRound` with new status
3. UI reflects: Current round status, attempt count, timer

**Filter Requirement:**
```typescript
supabase
  .channel(`team:${teamId}`)
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "team_round_progress",
      filter: `team_id=eq.${teamId}`  // ← MUST HAVE
    },
    (payload) => { /* update tier UI */ }
  )
  .subscribe();
```

---

## 5. FILTER RULES

### 5.1 Admin Subscriptions

**Scope:** Admin sees all data (no filtering for visibility, but organize by table)

| Subscription | Filter | Reason |
|--------------|--------|--------|
| `admin:teams` | `None` | Admin must see all teams for approval | 
| `admin:progress` | `None` | Admin must see all team progress |
| `admin:rounds` | `filter: { eq: { game_id: activeGameId } }` (optional) | Reduces noise; only watch active game |

### 5.2 Team Subscriptions (Future Implementation)

**Scope:** Team sees only its own data (enforced via filter for privacy)

| Subscription | Filter | Reason |
|--------------|--------|--------|
| `team:progress` | `filter: { eq: { team_id: teamId } }` | **REQUIRED** — Prevents data leak |
| `team:rounds` | `filter: { eq: { game_id: activeGameId } }` | Limits to current game rounds |

### 5.3 Filter Syntax Examples

**Supabase Realtime Filter Syntax:**

```typescript
// Single field equality
{ filter: "team_id=eq.550e8400-e29b-41d4-a716-446655440000" }

// String equality
{ filter: "status=eq.ACTIVE" }

// Multiple conditions (AND)
{ filter: "game_id=eq.ABC&round_number=gt.1" }  // AND operator is &

// IN operator (multiple values)
{ filter: "status=in.(ACTIVE,COMPLETED)" }
```

**DO NOT** use client-side filtering as security boundary. Always filter at subscription level.

---

## 6. REALTIME PERMISSIONS & SECURITY

### 6.1 Authentication Context

**Current System:** Custom JWT (stored in `session` cookie)

**Realtime Subscription Auth:**
- Uses Supabase `anon` key (No Row-Level Security on realtime tables)
- **Security Model:** Backend-driven realtime (recommended)
  - Backend validates custom JWT
  - Backend initiates subscription server-side
  - Only filtered events broadcast to client
  - **Alternative (Future):** Migrate to RLS + Supabase JWT

### 6.2 Data Access Control

| User Role | Tables | Filtering |
|-----------|--------|-----------|
| **Team** (regular user) | `team_round_progress` (own team only) | `team_id=eq.{teamId}` |
| **Admin** | `teams`, `rounds`, `team_round_progress` | None (admin sees all) |
| **Anon** | None | N/A |

### 6.3 Column Visibility

All columns in realtime events are public (no redaction). Treat realtime as low-security broadcast—backend must validate before storing in Redux.

---

## 7. EVENT TYPES & LIFECYCLE

### 7.1 Supported Events

Only these operations trigger realtime events:

| Operation | Event Type | Reachability |
|-----------|-----------|--------------|
| INSERT new row | `INSERT` | Rare (new rounds, new teams) |
| UPDATE field | `UPDATE` | **HIGH FREQUENCY** (status, attempt_count) |
| DELETE row | `DELETE` | Rare (game restart only) |

### 7.2 Example Event Workflows

**Workflow 1: Team Attempts Round**

```
1. Team submits answer via /api/game/submit
2. Backend validates → incorrect
3. Backend UPDATEs team_round_progress: attempt_count++
4. Realtime fires UPDATE event
5. Admin dashboard receives event
6. Redux updates attempt_count display
7. UI shows "2 attempts used"
```

**Workflow 2: Team Completes Round**

```
1. Team submits answer via /api/game/submit
2. Backend validates → correct
3. Backend UPDATEs team_round_progress: status=COMPLETED, completed_at=NOW()
4. Backend UPDATEs team_round_progress (NEXT round): status=ACTIVE, started_at=NOW()
5. Realtime fires 2 UPDATE events
6. Admin dashboard receives both events
7. Dispatch refetch of /api/v1/admin/teams-progress
8. UI updates: Current round marked COMPLETED, next round marked ACTIVE
```

---

## 8. BACKEND GUARANTEES

The following backend behaviors are guaranteed and form the contract:

1. **Atomicity:** All mutations execute within transactions. Both status and timestamp updates succeed or both fail.

2. **Consistency:** No partial updates. If `status` changes, `completed_at`/`failed_at` also updates.

3. **Realtime Delivery:** Every UPDATE to `team_round_progress`, `teams`, `rounds` triggers a realtime event within 100ms.

4. **No Orphans:** Circular foreign keys prevent orphaned records. CASCADEs enforce referential integrity.

5. **Event Ordering:** Events ordered by commit timestamp. Process `old` before `new` to detect delta.

6. **Error Handling:** If backend mutation fails, no realtime event fires. Frontend will not see partial state.

---

## 9. FRONTEND IMPLEMENTATION CHECKLIST

### Phase 1: Admin Teams Realtime
- [ ] Create `hooks/useAdminTeamsRealtime.ts`
- [ ] Subscribe to `teams` table UPDATE events
- [ ] Dispatch Redux `updateAdminTeam(event.new)`
- [ ] Test: Approve team in one tab, see update in other tab instantly

### Phase 2: Admin Progress Realtime
- [ ] Create `hooks/useAdminProgressRealtime.ts`
- [ ] Subscribe to `team_round_progress` table UPDATE events
- [ ] Dispatch thunk to refetch `/api/v1/admin/teams-progress`
- [ ] Test: Submit answer in game, see attempt_count increment in admin dashboard

### Phase 3: Cleanup & Edge Cases
- [ ] Ensure `removeChannel()` called on component unmount
- [ ] Test: Unmount admin component, verify WebSocket closes
- [ ] Handle: Connection drop → auto-reconnect (Supabase client handles)
- [ ] handle: Multiple tabs → deduplicate subscriptions (browser feature)

### Phase 4: Field Name Validation
- [ ] Code review: Search codebase for field names NOT in standardization table
- [ ] Replace: All `attempts` with `attempt_count`  
- [ ] Replace: All `status` (in games context) with explicit enum values
- [ ] Validate: All Redux selectors use canonical field names

---

## 10. KNOWN LIMITATIONS & WORKAROUNDS

| Issue | Impact | Workaround |
|-------|--------|-----------|
| Supabase realtime has 100+ subscriber limit per table | Admin + many team clients | Use server-side aggregation via SSE on high-load events |
| No ordered event queue guarantees > 100 events/sec | Rapid submissions could miss events | Implement event deduplication + periodic refetch |
| WebSocket reconnect ~5s after network loss | Brief UI stall | Show "Updating..." spinner during connection loss |
| RLS not enabled on realtime tables | Data visible to anon key | Use backend-driven filtering until RLS added |

---

## 11. TESTING CHECKLIST

Use this to validate realtime integration:

```bash
# Test 1: Subscribe → Update → Event received
✅ Open admin dashboard in Tab1
✅ Open game in Tab2
✅ Submit answer in Tab2
✅ Observe: Tab1 shows attempt_count increment in real-time < 1s

# Test 2: Multi-screen approval
✅ Open approval panel in Tab1
✅ Open team progress in Tab2
✅ Approve team in Tab1
✅ Observe: Tab2 shows team join admin dashboard instantly

# Test 3: Connection drop recovery
✅ Disconnect network (DevTools → Offline)
✅ Browser auto-reconnects after 5s
✅ New updates received post-reconnect

# Test 4: Cleanup on unmount
✅ Open admin dashboard
✅ Open DevTools → Network → WebSocket
✅ Navigate away from admin dashboard
✅ Observe: WebSocket connection closes
✅ No memory leak after 10 tab switches
```

---

## 12. VERSION HISTORY

| Date | Changes | Author |
|------|---------|--------|
| 2026-03-17 | Initial contract document | Platform Team |

---

## Questions?

**Contact:** Backend Architecture / Realtime Lead  
**Schema Issues:** Check against actual Supabase database  
**Event Processing:** Refer to Section 4 (Event → UI Mapping)
