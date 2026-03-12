# Backend Architecture Rules (For Code Generation)

This document outlines the non-negotiable rules for all backend development. These rules must be strictly followed to ensure consistency, maintainability, and data integrity.

## 1 Strict Layer Separation

All backend code must follow this execution flow without exception.

**Route (HTTP)** → **Controller** → **Service** → **Repository / DB**

### Layer Responsibilities

Layer

Responsibility

Forbidden Actions

**Route**

HTTP method handling (GET, POST, etc.)

Containing any business logic.

**Controller**

Request parsing, validation, and response formatting

Querying the database directly.

**Service**

Core business logic, rule validation, orchestration

Reading Request objects or handling HTTP concerns.

**Repository**

Executing database queries (via Supabase)

Containing business logic.

### Mandatory Constraints

- **Routes** must not contain business logic. They only forward requests to controllers.
- **Controllers** must not query the database. They delegate all data operations to services.
- **Services** must not read Request objects. They operate on plain data passed from the controller.
- **Only the repository layer** interacts with the Supabase client.

## 2 Centralized Database Access

All database queries must be encapsulated within repository modules to prevent duplication and simplify debugging.

- **Location:** lib/db/
- **Example Files:**
  - gamesRepo.ts
  - roundsRepo.ts
  - teamsRepo.ts
  - submissionsRepo.ts

**Rules:**

- **Services call repository functions** to fetch or persist data.
- **Controllers must never execute queries.**
- **Direct Supabase usage is forbidden** outside the lib/db/ directory.

## 3 Deterministic Error Handling

Every API response, especially in error cases, must follow a consistent, predictable format.

Error Response For

{

"error": "ERRORCODE",

"message": "Human readable message"

}

### Rules

- Never return raw database or system exceptions to the client.
- Never return ambiguous or generic messages.
- Error codes must be consistent across all services.

### Valid Error Code Examples

- `UNAUTHORIZED`
- `GAME_NOT_ACTIVE`
- `ROUND_LOCKED`
- `INVALID_SUBMISSION`
- `TEAM_NOT_FOUND`

## 4 Input Validation Before Business Logic

All request payloads must be validated before they reach the service layer. This ensures the service only works with structurally sound data.

### Validation Flow

Route → Controller → Validator → Service

### Rules

- Validation schemas (e.g., using Zod or a similar library) must exist in the `/validators` directory.
- Services must be able to assume they are receiving validated and sanitized input.
- Controllers are responsible for rejecting invalid input with a clear error response before calling the service.

## 5 Enforce Game State Rules in Service Layer

Game state transitions are critical and must be strictly validated within the service layer. Illegal transitions must be rejected.

### Valid Game Status Transitions

- `NOT_STARTED` → `ACTIVE`
- `ACTIVE` → `PAUSED`
- `PAUSED` → `ACTIVE`
- `ACTIVE` → `ENDED`

### Rules

- Services must contain the logic to validate and reject any illegal state transitions.
- Database updates must never bypass these checks.
- All APIs, including admin endpoints, must enforce these state constraints.

## 6 Database Must Enforce Critical Integrity

Application-level logic is not enough. Critical data integrity rules must also be enforced directly in the database schema using constraints.

### Examples from the Current Schema

- `team_round_progress`: `UNIQUE(team_id, round_id)`
- `reward_words`: `UNIQUE(team_id, game_id)`
- `rounds`: `UNIQUE(game_id, round_number)`

### Rules

- Never rely solely on application logic to protect critical data relationships.
- Enforce all unique relationships and referential integrity with database constraints.

## 7 Controllers Must Be Stateless

Controllers should be pure functions that handle HTTP concerns only. They must not store, cache, or derive any gameplay state.

### Forbidden Controller Logic

- Tracking or incrementing attempt counts.
- Calculating round progress.
- Deriving team state from multiple sources.

### Source of Truth

All state must be explicitly fetched from the database via the service and repository layers. The only valid sources are tables like:

- `team_round_progress`
- `submissions`
- `reward_words`

## 8 Services Must Be Idempotent Where Possible

Operations should be designed so that executing them multiple times has the same effect as executing them once. This prevents data corruption from duplicate requests or logic errors.

### Example: Unlocking a Round

Calling an "unlock next round" function twice for the same team should not create duplicate progress records.

### Required Pattern

1. Check for the existence of the target state (e.g., is the round already unlocked?).
2. If the state exists, return the existing state/data without making changes.
3. If the state does not exist, perform the operation to create it.

## 9 Admin Actions Must Be Logged

All administrative operations that modify game state or team data must be recorded in the `admin_logs` table for auditability and debugging.

### Actions That Must Be Logged

- Game start, pause, resume, end
- Round unlock or reset
- Penalty application

### Responsibility

The logging of these actions must happen within the service layer as part of the business operation, not in the controller.

## 10 Game Logic Must Be Configuration Driven

Game-specific behavior and rules must not be hardcoded. They should be loaded from the database configuration to make the system flexible and data-driven.

### Implementation

The schema supports this via the `rounds.configuration` column, which stores a `jsonb` object containing rules for that round.

### Rules

- Services must read round behavior (e.g., time limits, scoring rules, answer validation logic) from the `configuration` JSON.
- Controllers must not contain hardcoded round rules.
- All game logic must remain data-driven, allowing new games to be created by changing configuration, not code.

