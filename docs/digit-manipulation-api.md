# Digit Manipulation — API Contract

**Last Updated:** March 2026
**Game:** Digit Manipulation
**System:** Clueless Event Platform

---

## 1. Overview

Digit Manipulation is a stateless, deterministic number puzzle game. Each team receives a multi-digit number and an ordered list of operations. They apply the operations sequentially and submit the final result.

### Design Principles

- **Stateless:** The backend stores no puzzle data. The number, operations, and correct answer are never persisted.
- **Deterministic:** Everything is derived from a seed: `hash(teamId + ":" + roundId)`. Same team, same round → same puzzle, always.
- **Reproducible:** The backend recomputes the correct answer on every submission. The cache is an optional performance layer, not a source of truth.
- **BigInt-safe:** All arithmetic uses integer math. No floating point. Division truncates toward zero.

### Seed → Puzzle Pipeline

```
(teamId, roundId)
       ↓
 FNV-1a hash → 32-bit seed
       ↓
 Mulberry32 PRNG
       ↓
 number (N digits, no leading zero)
 operations (ordered list from config)
       ↓
 executeOperations(number, operations)
       ↓
 correct answer (never sent to frontend)
```

---

## 2. GET Current Round

Retrieves the active puzzle for the authenticated team.

```
GET /api/v1/games/current/round
Authorization: session cookie (JWT)
```

### Success Response — `200 OK`

```json
{
  "success": true,
  "roundId": "a3f1c2d4-...",
  "roundNumber": 1,
  "number": "1234567890",
  "operations": [
    { "type": "MULTIPLY", "operand": 3 },
    { "type": "SHIFT_LEFT" },
    { "type": "ADD", "operand": 17 },
    { "type": "REVERSE" },
    { "type": "DIVIDE", "operand": 5 }
  ],
  "attemptsLeft": 3
}
```

### Field Reference

| Field | Type | Description |
|---|---|---|
| `roundId` | `string` (UUID) | Used in the submission endpoint |
| `roundNumber` | `number` | 1-indexed round position |
| `number` | `string` | The starting number (string to preserve all digits) |
| `operations` | `Operation[]` | Ordered list — apply left to right |
| `attemptsLeft` | `number` | Remaining submissions before round is failed |

### Operation Types

| Type | Has `operand` | Description |
|---|---|---|
| `MULTIPLY` | yes | `n * operand` |
| `DIVIDE` | yes | `n / operand` (truncates toward zero) |
| `ADD` | yes | `n + operand` |
| `SUBTRACT` | yes | `n - operand` |
| `SHIFT_LEFT` | no | Rotate digits left: `12345` → `23451` |
| `SHIFT_RIGHT` | no | Rotate digits right: `12345` → `51234` |
| `REVERSE` | no | Reverse all digits: `12345` → `54321` |

> **Note:** Operands are returned as numbers in the API response. Teams should use integer arithmetic when computing the result. Division always truncates (e.g. `10 / 3 = 3`, `-10 / 3 = -3`).

> **Note:** Digit operations (SHIFT_LEFT, SHIFT_RIGHT, REVERSE) on negative numbers preserve the sign. The sign is stripped, the digit operation is applied, then the sign is reapplied.

---

## 3. Submit Answer

Submit the computed result for the current round.

```
POST /api/v1/rounds/:roundId/submissions
Authorization: session cookie (JWT)
Content-Type: application/json
```

### Request Body

```json
{
  "answer": "98147"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `answer` | `string` | yes | Must be a valid integer string. Use strings to avoid JavaScript number precision loss on large values. |

### Success Response — `200 OK`

```json
{
  "success": true,
  "correct": true,
  "attemptsLeft": 3
}
```

```json
{
  "success": true,
  "correct": false,
  "attemptsLeft": 2
}
```

| Field | Type | Description |
|---|---|---|
| `correct` | `boolean` | Whether the submitted answer matched |
| `attemptsLeft` | `number` | Remaining attempts (0 means the round is now FAILED) |

---

## 4. Error Responses

All errors follow this shape:

```json
{
  "success": false,
  "error": "ERROR_CODE: detail"
}
```

### Error Reference

| Error Code | HTTP Status | Cause |
|---|---|---|
| `INVALID_SUBMISSION: answer is missing` | 400 | Request body has no `answer` field |
| `INVALID_SUBMISSION: answer must be a string` | 400 | `answer` is not a string (e.g. number, null) |
| `INVALID_SUBMISSION: answer is empty` | 400 | `answer` is an empty string or only whitespace |
| `INVALID_SUBMISSION: answer must be numeric` | 400 | `answer` contains non-digit characters (e.g. `"abc"`, `"3.14"`) |
| `ROUND_ALREADY_COMPLETED` | 400 | Team already solved this round |
| `MAX_ATTEMPTS_REACHED` | 400 | All 3 attempts exhausted; round is FAILED |
| `ACTIVE_ROUND_NOT_FOUND` | 400 | Team has no active round (check game status) |
| `ROUND_NOT_FOUND` | 400 | `roundId` does not exist |

### Examples

```json
{
  "success": false,
  "error": "CONTROLLER_SUBMISSION_FAILED: INVALID_SUBMISSION: answer must be numeric"
}
```

```json
{
  "success": false,
  "error": "CONTROLLER_SUBMISSION_FAILED: MAX_ATTEMPTS_REACHED"
}
```

```json
{
  "success": false,
  "error": "CONTROLLER_SUBMISSION_FAILED: ROUND_ALREADY_COMPLETED"
}
```

---

## 5. Important Notes

### Answer must be a string

Submit `answer` as a string, not a number. JavaScript's `number` type loses precision for integers beyond 2^53. The backend handles BigInt internally and expects the raw digit string.

```js
// WRONG
fetch("/api/v1/rounds/:id/submissions", { body: JSON.stringify({ answer: 98147 }) })

// CORRECT
fetch("/api/v1/rounds/:id/submissions", { body: JSON.stringify({ answer: "98147" }) })
```

### Operations are ordered — do not reorder

Apply operations exactly in the order returned. The backend applies them in the same order when recomputing the answer.

### The backend always recomputes

The correct answer is never sent to the frontend. On every submission, the backend regenerates the puzzle from scratch (using the seed) and computes the expected answer independently.

### Negative answers are valid

Some operation chains can produce negative numbers. A negative answer like `"-4321"` is a valid submission string.

---

## 6. Deterministic Guarantee

Given the same `teamId` and `roundId`, the backend will always produce the same:

- starting number
- operation list
- correct answer

This holds even if:
- the server restarts
- the cache is cleared
- the round is re-fetched multiple times

The puzzle is derived purely from `hash(teamId + ":" + roundId)` and the round's configuration stored in the database. No randomness is stored anywhere.

```
Team A, Round 1  →  seed 0x3f2a1b9c  →  number: 5823901746  →  answer: 391
Team A, Round 1  →  seed 0x3f2a1b9c  →  number: 5823901746  →  answer: 391  ✓ (same)
Team B, Round 1  →  seed 0x8c41de07  →  number: 1047382659  →  answer: 812  (different team)
```

---

## 7. Submission Pipeline (Internal)

```
POST /api/v1/rounds/:roundId/submissions
  │
  ├─ route.ts
  │   verifyToken → extract teamId
  │   parse body → { answer }
  │
  ├─ submissionController.ts
  │   validate: answer present and is string
  │   call submitAnswerService
  │
  ├─ submissionService.ts
  │   getRoundContextRepo → { gameName, configuration, roundNumber }
  │   dispatch to submissionHandlers["Digit Manipulation"]
  │
  └─ digitManipulationService.ts
      validateSubmissionAnswer → numeric check
      parseConfiguration → validate config shape
      getRoundAttemptStatusRepo → guard COMPLETED / FAILED
      getOrResolvePuzzle → deterministic answer (cache or recompute)
      compare BigInt(answer) === correctAnswer
      insertSubmissionRepo → record attempt
      if correct: completeRoundRepo + activateNextRoundRepo
      if wrong: decreaseAttemptRepo
      return { correct, attemptsLeft }
```
