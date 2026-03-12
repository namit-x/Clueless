# Backend Architecture Rules (For Code Generation)

This document outlines the non-negotiable rules for all backend development. These rules must be strictly followed to ensure consistency, maintainability, and data integrity.

## 1. Strict Layer Separation

All backend code must follow this execution flow without exception.

**Route (HTTP)** → **Controller** → **Service** → **Repository / DB**

### Layer Responsibilities

| Layer        | Responsibility                                     | Forbidden Actions                                    |
| :----------- | :------------------------------------------------- | :--------------------------------------------------- |
| **Route**    | HTTP method handling (GET, POST, etc.)             | Containing any business logic.                       |
| **Controller** | Request parsing, validation, and response formatting | Querying the database directly.                      |
| **Service**  | Core business logic, rule validation, orchestration | Reading `Request` objects or handling HTTP concerns. |
| **Repository** | Executing database queries (via Supabase)          | Containing business logic.                           |

### Mandatory Constraints
- **Routes** must not contain business logic. They only forward requests to controllers.
- **Controllers** must not query the database. They delegate all data operations to services.
- **Services** must not read `Request` objects. They operate on plain data passed from the controller.
- **Only the repository layer** interacts with the Supabase client.

## 2. Centralized Database Access

All database queries must be encapsulated within repository modules to prevent duplication and simplify debugging.

- **Location:** `lib/db/`
- **Example Files:**
    - `gamesRepo.ts`
    - `roundsRepo.ts`
    - `teamsRepo.ts`
    - `submissionsRepo.ts`

**Rules:**
- **Services call repository functions** to fetch or persist data.
- **Controllers must never execute queries.**
- **Direct Supabase usage is forbidden** outside the `lib/db/` directory.

## 3. Deterministic Error Handling

Every API response, especially in error cases, must follow a consistent, predictable format.

### Error Response Format
```json
{
  "error": "ERROR_CODE",
  "message": "Human readable message"
}