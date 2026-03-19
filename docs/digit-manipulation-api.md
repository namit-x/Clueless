# Digit Manipulation Game — Frontend API Contract

**Last Updated:** March 2026
**System:** Clueless Event Platform
**Audience:** Frontend developers building the team interface

---

## 1. Overview

**What is Digit Manipulation?**

A stateless number puzzle game. Each team receives:
- A starting number (10+ digits)
- An ordered list of operations to apply
- 3 attempts to submit the correct final result

**Key Design Principles:**

1. **Stateless:** The server stores no puzzle data—no numbers, operations, or answers are persisted.
2. **Deterministic:** For the same team and round, you always get the same puzzle. Refreshing the page shows the identical number and operations.
3. **Verified:** The backend never trusts the frontend. On every submission, the correct answer is recomputed independently. Cheating by modifying the answer client-side is impossible.

---

## 2. GET Current Round

Retrieve the active puzzle and attempt count for the authenticated team.

### Request

```
GET /api/v1/games/current/round
Authorization: session cookie (JWT)
```

### Success Response — `200 OK`

```json
{
  "success": true,
  "roundId": "550e8400-e29b-41d4-a716-446655440000",
  "roundNumber": 1,
  "number": "9876543210",
  "operations": [
    { "type": "ADD", "operand": 5 },
    { "type": "MULTIPLY", "operand": 2 },
    { "type": "REVERSE" },
    { "type": "SHIFT_LEFT" },
    { "type": "SUBTRACT", "operand": 100 }
  ],
  "attemptsLeft": 3
}
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `roundId` | string (UUID) | Unique round identifier. Pass this to the submission endpoint. |
| `roundNumber` | number | 1-indexed round position (1, 2, 3, ...). |
| `number` | string | The starting number. **Always a string** to preserve all digits. |
| `operations` | Operation[] | Ordered list of operations—apply left to right, in order. |
| `attemptsLeft` | number | How many submissions you have left (0–3). Refresh to see current value. |

### How to Use

1. Display the `number` to the team.
2. Show the operations in order (with operands if present).
3. Team applies operations manually and calculates the result.
4. Display `attemptsLeft` prominently—update after each submission.
5. If `attemptsLeft` hits 0, disable the submission button.

---

## 3. Operation Types

| Type | Has Operand | Formula | Example |
|---|---|---|---|
| `ADD` | yes | `n + operand` | `100 + 5 = 105` |
| `SUBTRACT` | yes | `n - operand` | `100 - 5 = 95` |
| `MULTIPLY` | yes | `n * operand` | `100 * 2 = 200` |
| `DIVIDE` | yes | `n / operand` (integer truncation) | `100 / 3 = 33` |
| `SHIFT_LEFT` | no | Rotate digits left 1 position | `12345 → 23451` |
| `SHIFT_RIGHT` | no | Rotate digits right 1 position | `12345 → 51234` |
| `REVERSE` | no | Reverse all digits | `12345 → 54321` |

### Special Cases

- **Negative numbers:** Digit operations preserve the sign. Example: `REVERSE` on `-12345` → `-54321`.
- **Single digit:** Shift/reverse on a single digit (e.g., `5`) returns the same digit.
- **Division truncates:** `10 / 3 = 3` (not 3.33). `-10 / 3 = -3`.

---

## 4. POST Submit Answer

Submit your computed result to complete the round.

### Request

```
POST /api/v1/rounds/:roundId/submissions
Authorization: session cookie (JWT)
Content-Type: application/json
```

**Path parameter:** Replace `:roundId` with the UUID from the GET current round response.

**Request Body:**

```json
{
  "answer": "9876543210"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `answer` | string | yes | **Must be a string**, not a number. Use strings to avoid JavaScript precision loss on large integers. Negative answers are valid (e.g., `"-12345"`). |

### Success Response — `200 OK`

**Correct answer:**

```json
{
  "success": true,
  "correct": true,
  "attemptsLeft": 3
}
```

**Incorrect answer:**

```json
{
  "success": true,
  "correct": false,
  "attemptsLeft": 2
}
```

| Field | Type | Description |
|---|---|---|
| `correct` | boolean | Whether the answer matched. |
| `attemptsLeft` | number | Remaining attempts (0 = round is now locked). |

### Submission Behavior

1. **Correct answer → Round complete:** You move to the next round. Subsequent submissions to this round are rejected.
2. **Wrong answer → Attempt consumed:** `attemptsLeft` decreases by 1. Try again.
3. **Attempts exhausted (0 remaining) → Round locked:** No more submissions allowed. You must wait for admin intervention or the round to be reset.

---

## 5. Error Codes & Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "ERROR_CODE: detail"
}
```

### Complete Error Reference

| Error Code | HTTP | Frontend Action | User Message |
|---|---|---|---|
| `INVALID_SUBMISSION: answer is missing` | 400 | Re-check form; ensure `answer` field is present | "Missing answer field in request" |
| `INVALID_SUBMISSION: answer must be a string` | 400 | Ensure `answer` is sent as a string, not a number | "Answer must be text, not a number" |
| `INVALID_SUBMISSION: answer is empty` | 400 | Reject empty input before sending | "Please enter an answer" |
| `INVALID_SUBMISSION: answer must be numeric` | 400 | Reject non-digit input (except leading `-` for negatives) | "Answer must contain only digits (and optional `-` sign)" |
| `ATTEMPTS_EXCEEDED` | 400 | Disable submission button; show round is locked | "No attempts remaining. This round is locked." |
| `MAX_ATTEMPTS_REACHED` | 400 | Same as above | "No attempts remaining. This round is locked." |
| `ROUND_ALREADY_COMPLETED` | 400 | Disable button; show round is already solved | "This round is already complete. Move to the next round." |
| `ROUND_LOCKED` | 400 | Disable button; explain round is not yet active | "This round is not yet active." |
| `GAME_NOT_ACTIVE` | 400 | Show: "Game has ended" | "The game is no longer active." |
| `RATE_LIMITED: too many submissions, wait...` | 400 | Disable submit button for 2–3 seconds | "Too many submissions. Please wait a moment." |
| `ROUND_NOT_FOUND` | 400 | Refresh page; check if round exists | "Round not found. Please refresh and try again." |
| `ACTIVE_ROUND_NOT_FOUND` | 400 | Likely game not started for your team | "No active round. Check game status." |

---

## 6. Attempts Logic

### What Happens

| Event | attemptsLeft Changes | Round Status |
|---|---|---|
| **Start of round** | `3` | ACTIVE |
| **First wrong submission** | `3` → `2` | ACTIVE (can still submit) |
| **Second wrong submission** | `2` → `1` | ACTIVE (final chance) |
| **Third wrong submission** | `1` → `0` | **LOCKED** (no more submissions) |
| **Correct submission** | stays `3` | COMPLETED (move to next round) |

### Frontend Behavior

- Display `attemptsLeft` in a prominent counter.
- Disable the submit button when `attemptsLeft === 0`.
- After a wrong submission, show encouraging UI: "Try again! X attempts left."
- After attempts exhausted: "Round locked. Waiting for admin intervention."
- After correct submission: "Round complete! Moving to next round..."

---

## 7. Rate Limiting

The API enforces **1 submission per 2–3 seconds per team** to prevent spam.

### What Happens

- **First submission:** Succeeds immediately.
- **Second submission within 2–3 seconds:** Rejected with `RATE_LIMITED` error.
- **After 2–3 seconds have passed:** Submission allowed.

### Frontend Handling

1. After a successful submission (correct or wrong), disable the submit button for 3 seconds.
2. Show a timer: "Please wait 3 seconds before submitting again."
3. Re-enable the button when the timer expires.
4. If the user tries to submit too early, show: "Too many submissions. Please wait a moment."

---

## 8. Idempotency

### Duplicate Submissions

If you submit the same (or different) answer after the round is already complete:

```json
{
  "success": false,
  "error": "ROUND_ALREADY_COMPLETED"
}
```

### What This Means

- **First correct submission → Success & round is complete.**
- **Any submission after that → Rejected.**
- The system **will not double-count** your score or progress.
- It's safe to retry (though it will fail predictably).

---

## 9. Deterministic Puzzle Guarantee

**Same team, same round = same puzzle always.**

```
Team A, Round 1
  → GET current round → number: 9876543210, operations: [...]
  → Refresh page → number: 9876543210, operations: [...] ✓ (identical)
  → Next day, fetch again → number: 9876543210, operations: [...] ✓ (still identical)

Team B, Round 1
  → GET current round → number: 1234567890, operations: [...] (different team, different puzzle)
```

### Why This Matters

- **No hidden randomness:** Every refresh shows the same data.
- **Reproducible:** If a team encounters a glitch, you can replay and debug.
- **Fair:** All teams with the same ID and round get identical puzzles.

---

## 10. Security Notes

### The Answer is Never Sent to Frontend

The backend **never** returns the correct answer in any response. It only:
- Returns the starting number and operations
- Accepts your submitted answer
- Tells you if it's correct (yes/no)

### The Backend Always Recomputes

Every time you submit:
1. The backend generates the number and operations independently.
2. The backend applies the operations independently.
3. The backend compares your answer to its computed result.
4. **The comparison is atomic and authoritative.**

### Cheating is Impossible

- Modifying the answer client-side before sending? Rejected by backend comparison.
- Trying to reverse-engineer the operations? The formula is deterministic but unfeasible to reverse on large numbers.
- Submitting random answers? You only have 3 attempts.

---

## 11. Response Codes Reference

### 200 OK

- GET current round succeeded.
- Submission accepted (correct or incorrect).

### 400 Bad Request

- Malformed input (missing answer field, non-string answer, etc.).
- Game or round not active.
- Attempt limit exceeded.
- Rate limited.

### 401 Unauthorized

- Session cookie missing or invalid.
- Re-authenticate and try again.

---

## 12. Example: Complete Flow

### 1. Team starts game

```bash
GET /api/v1/games/current/round
```

Response:
```json
{
  "success": true,
  "roundId": "abc-123",
  "roundNumber": 1,
  "number": "1234567890",
  "operations": [
    { "type": "ADD", "operand": 10 },
    { "type": "REVERSE" }
  ],
  "attemptsLeft": 3
}
```

Team calculates:
- Start: `1234567890`
- ADD 10 → `1234567900`
- REVERSE → `0097654321` → `97654321` (leading zero stripped)

### 2. First submission (wrong)

```bash
POST /api/v1/rounds/abc-123/submissions
{ "answer": "97654320" }
```

Response:
```json
{
  "success": true,
  "correct": false,
  "attemptsLeft": 2
}
```

UI: "Incorrect. You have 2 attempts left."

### 3. Second submission (correct)

```bash
POST /api/v1/rounds/abc-123/submissions
{ "answer": "97654321" }
```

Response:
```json
{
  "success": true,
  "correct": true,
  "attemptsLeft": 3
}
```

UI: "Correct! Round complete. Moving to next round..."

### 4. Later: Try to re-submit

```bash
POST /api/v1/rounds/abc-123/submissions
{ "answer": "97654321" }
```

Response:
```json
{
  "success": false,
  "error": "ROUND_ALREADY_COMPLETED"
}
```

---

## 13. FAQ

**Q: Can I change the starting number?**
A: No. The server generates it deterministically. You can't change it client-side (and the server would ignore changes anyway).

**Q: Can I submit partial results?**
A: Only the final answer. Submit the result after all operations.

**Q: What if I need more than 3 attempts?**
A: The game enforces a 3-attempt limit per round. If you exhaust attempts, contact an admin or wait for the round to be reset.

**Q: Why are big numbers sent as strings?**
A: JavaScript's `number` type loses precision above 2^53. Using strings preserves all digits accurately.

**Q: Does the puzzle change if I refresh?**
A: No. Same team + round = same puzzle, always.

**Q: Can I see my past submissions?**
A: The server records all submissions. Admins can review them. Teams cannot see a history endpoint (yet).

---

## 14. Contact & Support

- **Bug report:** Report issues in the admin dashboard or contact the game admin.
- **Clarification:** Check this contract first. If you have questions, ask in the team chat.
