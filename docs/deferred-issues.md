# Deferred Issues & Intentional Behaviors

This document catalogs issues identified during architecture analysis that are **deferred** (not fixed) because they reflect intentional design decisions or incomplete features.

---

## 🎯 INTENTIONAL BEHAVIORS (DO NOT CHANGE)

### Issue #1: Hardcoded Game ID "YOU_ARE_GAY" for Non-LIVE Games

**File:** [services/gameService.ts](../services/gameService.ts)

**Code:**
```typescript
const games = data.map((game) => ({
    id: game.status !== "LIVE" ? "YOU_ARE_GAY" : game.id,
    name: game.name,
    // ...
}));
```

**Why It's Intentional:**
- Anti-abuse/security measure to return an invalid ID for games not currently active
- Prevents teams from attempting to start games that shouldn't be playable
- The invalid ID will fail gracefully on backend route handlers

**Impact:**
- Users cannot attempt to play non-LIVE games via direct URL manipulation
- Frontend UI prevents button clicks, and invalid IDs provide a second layer of protection

**Future Plan:**
- Monitor if this causes issues once realtime game state changes are implemented
- May need to handle this ID more gracefully with better error messages

---

## 🚧 INCOMPLETE FEATURES (NOT IMPLEMENTED)

### Issue #2: Quiz Game Component (Empty)

**File:** [components/games/quiz/QuizGame.tsx](../components/games/quiz/QuizGame.tsx)

**Current State:**
```typescript
export default function QuizGame() {
    return <></>;  // Empty component
}
```

**Why Deferred:**
- Quiz game UI/logic not yet designed
- Feature is incomplete, not a bug in existing code
- No specification for quiz interaction model

**Impact:**
- If admin starts a Quiz game, team sees blank screen
- Game is unplayable but doesn't crash

**Future Plan:**
- Implement Quiz component with question/answer UI
- Integrate with quiz submission API (`POST /api/v1/rounds/[roundId]/submissions`)
- Expected similar flow to TreasureHunt: fetch current round, display question, submit answer

**Acceptance Criteria When Fixed:**
- Render question with options/input
- Send submission to `/api/v1/rounds/[roundId]/submissions`
- Handle correct/incorrect responses
- Progress to next round on correct answer

---

### Issue #3: Digit Manipulation Game Component (Empty)

**File:** [components/games/digit-manipulation/DigitManipulationGame.tsx](../components/games/digit-manipulation/DigitManipulationGame.tsx)

**Current State:**
```typescript
export default function DigitManipulationGame() {
    return <></>;  // Empty component
}
```

**Why Deferred:**
- Digit Manipulation game UI/logic not yet designed
- Feature is incomplete

**Impact:**
- If admin starts a Digit Manipulation game, team sees blank screen
- Game is unplayable

**Future Plan:**
- Implement Digit Manipulation component
- Design interaction model (if not already specified in GAME_ENGINE.md or RULES.md)
- Integrate with submission API

---

## 📋 MINOR ISSUES (LOW PRIORITY)

### Issue #4: Console.log() Statements in Production Code

**Files:**
- [app/(app)/dashboard/page.tsx](../app/(app)/dashboard/page.tsx) - removed with recent fix
- [app/(app)/games/page.tsx](../app/(app)/games/page.tsx) - removed with recent fix
- [components/games/treasure-hunt/TreasureHuntGame.tsx](../components/games/treasure-hunt/TreasureHuntGame.tsx) - multiple console logs remain

**Status:** Most have been removed in recent fixes.

**Remaining:** TreasureHuntGame component still has `console.log()` statements for debugging.

**Note:** These are harmless in production but indicate debug code left in place.

---

### Issue #5: Weak JWT Secret Validation

**File:** [lib/auth.ts](../lib/auth.ts)

**Current:**
```typescript
function getJwtSecret(): Uint8Array {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret.trim().length === 0) {
        throw new Error("Missing JWT_SECRET environment variable");
    }
    return new TextEncoder().encode(jwtSecret);
}
```

**Problem:**
- No minimum length requirement
- A secret like `"a"` would pass validation and is cryptographically weak

**Status:** Low priority for MVP
- Environment validation should happen in infra/CI
- Secret should be validated at deployment time, not runtime

**Future Plan:**
- Add minimum length check (32+ characters recommended for HS256)
- Or delegate to infrastructure secret management validation

---

### Issue #6: Admin User Lookup Index-Based (Fragile)

**File:** [middleware/verifyToken.ts](../middleware/verifyToken.ts)

**Current:**
```typescript
const ADMIN_USERS = process.env.ADMIN_STRINGS?.split(",") || [];
const adminIndex = ADMIN_USERS.findIndex(
    (admin) => admin.trim() === decoded.adminName?.trim()
);
// ...
const ownerId = `admin_${adminIndex}`;
```

**Problem:**
- Admin ID is index-based
- If `ADMIN_STRINGS` order changes, existing tokens become invalid without re-login
- Fragile when admin list is modified

**Status:** Low priority for MVP
- MVP likely has stable admin list
- Only affects admin users (small number)

**Future Plan:**
- Generate stable admin IDs at deployment time
- Store mapping in database
- Include explicit admin ID in JWT instead of reconstructing from name

---

### Issue #7: No Error Boundaries on Game Components

**Files:**
- [components/games/treasure-hunt/TreasureHuntGame.tsx](../components/games/treasure-hunt/TreasureHuntGame.tsx)
- [components/games/blind-code/BlindCodeGame.tsx](../components/games/blind-code/BlindCodeGame.tsx)

**Status:** Low priority
- If component throws, entire page unmounts
- Reduces resilience but not a functional bug

**Future Plan:**
- Wrap game components in error boundary
- Display user-friendly error message
- Provide "retry" or "go back to dashboard" option

---

### Issue #8: No Timeout on Judge0 API Call

**File:** [services/games/blindCodeService.ts](../services/games/blindCodeService.ts)

**Current:**
```typescript
const response = await fetch(
    "https://ce.judge0.com/submissions?wait=true",
    { method: "POST", ... }
);
```

**Problem:**
- No timeout on fetch
- `wait=true` means server waits for compilation + execution
- If Judge0 is slow, entire request hangs

**Status:** Low-medium priority for Blind Code game
- Affects UX during Blind Code submissions
- Judge0 is external service (reliability not guaranteed)

**Future Plan:**
- Add AbortController with 10s timeout
- Implement fallback/retry logic
- Show user feedback: "Code execution timed out"
- Consider async submission model (submit → poll for results)

---

### Issue #9: ~~Session Stream No Server Heartbeat~~ (RESOLVED)

**Status:** Resolved — SSE removed. Session invalidation now handled by Supabase Realtime subscription with periodic polling fallback in `useSessionRealtime.ts`.

---

## 📊 SUMMARY

| Category | Count | Resolution |
|----------|-------|-----------|
| **Intentional Behaviors** | 1 | Preserve as-is |
| **Incomplete Features** | 2 | Implement when specifications ready |
| **Minor Issues** | 6 | Fix opportunistically or defer to v2 |
| **TOTAL** | 9 | All non-critical |

---

## 🔄 When to Revisit

These deferred issues should be revisited:

1. **After Realtime Integration:** Security model (Game ID, admin IDs) may need review
2. **Before Production Deployment:** Minor issues (#4-#9) should be addressed
3. **When Quiz/Digit Games Are Specified:** Features #2-#3 ready to implement
4. **During Load Testing:** Judge0 timeout (#8) should be tested at scale

---

## 📝 NOTES FOR FUTURE DEVELOPERS

- The intentional game ID "YOU_ARE_GAY" is a **feature**, not a bug—do not remove
- Incomplete game components should follow the TreasureHunt pattern (fetch round → submit → progress)
- All remaining issues have `TODO` comments in code if critical
- Review [GAME_ENGINE.md](../GAME_ENGINE.md) and [RULES.md](../RULES.md) before implementing missing features
