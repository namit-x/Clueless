# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server on port 8088
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

There are no automated tests in this project.

## Architecture

This is a **Next.js 15 App Router** project (TypeScript) for a multi-game competition platform. The backend enforces a strict 4-layer architecture — violating this is not acceptable:

```
app/api/**/route.ts  →  controllers/  →  services/  →  lib/repositories/  →  PostgreSQL (via pg pool)
```

**Layer rules (enforced, not optional):**
- **Routes** (`app/api/`): HTTP method dispatch only. No business logic.
- **Controllers** (`controllers/`): Parse request, validate input, format response. Never query DB.
- **Services** (`services/`): All business logic and orchestration. Never read `Request` objects.
- **Repositories** (`lib/repositories/`): All DB queries via native `pg` driver. No business logic.

**Note:** `RULES.md` says repositories use Supabase, but the actual code uses the native `pg` driver with a connection pool in `lib/db.ts`.

## Key Patterns

**Error responses** must use this exact format:
```json
{ "error": "ERROR_CODE", "message": "Human readable message" }
```

**Game state** is always derived from the database — never held in application memory.

**Adding a new game type:** Register it in the `gameHandlers` map in `services/gameService.ts`, create a service in `services/games/`, and add corresponding repository functions.

**Validators** (`validators/`) use Zod v4 and are called from controllers before invoking services.

**Admin actions** must be logged to the `admin_logs` table via the repository layer.

## Auth & Session

- Cookie-based JWT sessions via `lib/auth.ts` and `lib/cookies.ts`
- Global middleware (`middleware.ts`) handles authentication, authorization, and feature flags
- Supabase is used for **Realtime** session monitoring only — all data queries go through native `pg`

## Database

PostgreSQL accessed via `pg` pool (`lib/db.ts`). Key tables: `teams`, `members`, `games`, `rounds`, `team_round_progress`, `submissions`, `reward_words`, `team_game_results`, `admin_logs`. See `DATABASE_SCHEMA.md` for full schema.

Game status transitions: `NOT_STARTED` → `ACTIVE` ⇄ `PAUSED` → `ENDED`

## Docs

- `ARCHITECTURE.md` — Layer overview
- `Backend_Architecture.md` — Detailed layer rules
- `DATABASE_SCHEMA.md` — Full schema
- `EXECUTION_FLOW.md` — Request lifecycle walkthroughs
- `GAME_ENGINE.md` — Game logic details
- `endpoint.md` — API endpoint reference
