# Execution Flow

This document describes the runtime behavior of the application, including API structure, request lifecycles, and game logic flows.

## 1. Project File Structure

# File Tree: clueless

**Generated:** 3/12/2026, 7:13:21 PM
**Root Path:** `/home/namit/Burning/Clueless/clueless`

```
├── 📁 app
│   ├── 📁 (app)
│   │   ├── 📁 admin
│   │   │   └── 📁 dashboard
│   │   │       └── 📄 page.tsx
│   │   ├── 📁 dashboard
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 games
│   │   │   └── 📄 page.tsx
│   │   └── 📄 layout.tsx
│   ├── 📁 (auth)
│   │   ├── 📁 login
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 register
│   │   │   └── 📄 page.tsx
│   │   └── 📄 layout.tsx
│   ├── 📁 (public)
│   │   ├── 📄 layout.tsx
│   │   └── 📄 page.tsx
│   ├── 📁 api
│   │   ├── 📁 admin
│   │   │   └── 📁 games
│   │   │       └── 📄 route.ts
│   │   ├── 📁 auth
│   │   │   ├── 📁 login
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 logout
│   │   │   │   └── 📄 route.ts
│   │   │   └── 📁 register
│   │   │       └── 📄 route.ts
│   │   ├── 📁 game
│   │   │   └── 📁 current
│   │   │       └── 📄 route.ts
│   │   ├── 📁 team
│   │   │   ├── 📁 check-name
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 dashboard
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 register
│   │   │   │   └── 📄 route.ts
│   │   │   └── 📁 validate
│   │   │       └── 📄 route.ts
│   │   └── 📁 v1
│   │       ├── 📁 admin
│   │       │   ├── 📁 games
│   │       │   │   ├── 📁 [gameId]
│   │       │   │   │   ├── 📁 end
│   │       │   │   │   │   └── 📄 route.ts
│   │       │   │   │   ├── 📁 pause
│   │       │   │   │   │   └── 📄 route.ts
│   │       │   │   │   ├── 📁 restart
│   │       │   │   │   │   └── 📄 route.ts
│   │       │   │   │   ├── 📁 resume
│   │       │   │   │   │   └── 📄 route.ts
│   │       │   │   │   └── 📁 start
│   │       │   │   │       └── 📄 route.ts
│   │       │   │   └── 📄 route.ts
│   │       │   └── 📁 teams
│   │       │       ├── 📁 [teamId]
│   │       │       │   ├── 📁 approve
│   │       │       │   │   └── 📄 route.ts
│   │       │       │   └── 📁 reject
│   │       │       │       └── 📄 route.ts
│   │       │       └── 📄 route.ts
│   │       ├── 📁 games
│   │       │   ├── 📁 [gameId]
│   │       │   │   └── 📁 start
│   │       │   │       └── 📄 route.ts
│   │       │   └── 📁 current
│   │       │       └── 📁 round
│   │       │           └── 📄 route.ts
│   │       ├── 📁 rounds
│   │       │   └── 📁 [roundId]
│   │       │       └── 📁 submissions
│   │       │           └── 📄 route.ts
│   │       └── 📁 teams
│   │           └── 📁 me
│   │               └── 📁 progress
│   │                   └── 📄 route.ts
│   ├── 📄 favicon.ico
│   ├── 🎨 globals.css
│   └── 📄 layout.tsx
├── 📁 components
│   ├── 📁 admin
│   │   ├── 📄 AdminLogsPanel.tsx
│   │   ├── 📄 AdminSidebar.tsx
│   │   ├── 📄 GameCard.tsx
│   │   ├── 📄 GameControlPanel.tsx
│   │   ├── 📄 TeamControlPanel.tsx
│   │   └── 📄 TeamProgressPanel.tsx
│   ├── 📁 dashboard
│   │   ├── 📄 DashboardHeader.tsx
│   │   ├── 📄 GameCard.tsx
│   │   ├── 📄 GameGrid.tsx
│   │   └── 📄 mockData.ts
│   ├── 📁 ui
│   │   ├── 📄 accordion.tsx
│   │   ├── 📄 button.tsx
│   │   ├── 📄 checkbox.tsx
│   │   ├── 📄 dialog.tsx
│   │   ├── 📄 input.tsx
│   │   ├── 📄 label.tsx
│   │   └── 📄 toast.tsx
│   ├── 📄 AuthLayout.tsx
│   ├── 📄 CTASection.tsx
│   ├── 📄 CountDown.tsx
│   ├── 📄 DisableDevTools.tsx
│   ├── 📄 FAQSection.tsx
│   ├── 📄 Footer.tsx
│   ├── 📄 GamesSection.tsx
│   ├── 📄 HeroSection.tsx
│   ├── 📄 HowItWorks.tsx
│   ├── 📄 Leaderboard.tsx
│   ├── 📄 NavBar.tsx
│   ├── 📄 PasswordInput.tsx
│   ├── 📄 PasswordStrength.tsx
│   ├── 📄 PrizesSection.tsx
│   ├── 📄 RulesSection.tsx
│   ├── 📄 ScrollReveal.tsx
│   └── 📄 Timeline.tsx
├── 📁 controllers
│   ├── 📄 adminTeamsController.ts
│   ├── 📄 gameController.ts
│   └── 📄 submissionController.ts
├── 📁 hooks
│   ├── 📄 use-mobile.tsx
│   ├── 📄 use-toast.ts
│   └── 📄 useDebounce.ts
├── 📁 lib
│   ├── 📁 repositories
│   │   ├── 📄 gameRepo.ts
│   │   ├── 📄 roundsRepo.ts
│   │   ├── 📄 routeLocationsRepo.ts
│   │   ├── 📄 submissionsRepo.ts
│   │   ├── 📄 teamProgressRepo.ts
│   │   ├── 📄 teamRoundProgressRepo.ts
│   │   ├── 📄 teamRoutesRepo.ts
│   │   └── 📄 teamsRepo.ts
│   ├── 📁 supabase
│   │   ├── 📄 client.ts
│   │   └── 📄 server.ts
│   ├── 📁 types
│   │   ├── 📄 dashboard.ts
│   │   └── 📄 team.ts
│   ├── 📄 auth.ts
│   ├── 📄 cookies.ts
│   ├── 📄 db.ts
│   └── 📄 utils.ts
├── 📁 middleware
│   ├── 📄 validateAdmin.ts
│   └── 📄 verifyToken.ts
├── 📁 public
│   ├── 🖼️ file.svg
│   ├── 🖼️ globe.svg
│   ├── 🖼️ next.svg
│   ├── 🖼️ vercel.svg
│   └── 🖼️ window.svg
├── 📁 services
│   ├── 📄 adminTeamsService.ts
│   ├── 📄 gameService.ts
│   └── 📄 submissionService.ts
├── 📁 supabase
│   ├── 📁 .branches
│   │   └── 📄 _current_branch
│   ├── 📁 .temp
│   │   ├── 📄 cli-latest
│   │   ├── 📄 gotrue-version
│   │   ├── 📄 pooler-url
│   │   ├── 📄 postgres-version
│   │   ├── 📄 project-ref
│   │   ├── 📄 rest-version
│   │   ├── 📄 storage-migration
│   │   └── 📄 storage-version
│   ├── 📁 migrations
│   │   ├── 📄 20260309120611_remote_schema.sql
│   │   └── 📄 20260309121247_treasure_hunt_tables.sql
│   ├── 📁 migrations_backup
│   │   ├── 📄 20260301040417_init_schema.sql
│   │   ├── 📄 20260307051544_add_description_to_games.sql
│   │   ├── 📄 20260307074837_auto_generate_ids.sql
│   │   ├── 📄 20260307132736_games_order_trigger.sql
│   │   ├── 📄 20260307133200_status_default_value.sql
│   │   ├── 📄 20260308102329_add_is_approved_to_teams.sql
│   │   └── 📄 20260309115540_add_treasure_hunt_tables.sql
│   ├── ⚙️ .gitignore
│   └── ⚙️ config.toml
├── 📁 validators
│   ├── 📄 gameSchema.ts
│   ├── 📄 team.ts
│   └── 📄 teamStepOne.ts
├── ⚙️ .gitignore
├── 📝 ARCHITECTURE.md
├── 📝 DATABASE_SCHEMA.md
├── 📝 EXECUTION_FLOW.md
├── ⚙️ components.json
├── 📄 eslint.config.mjs
├── 📄 next.config.ts
├── ⚙️ package-lock.json
├── ⚙️ package.json
├── 📄 postcss.config.js
├── 📄 schema.sql
├── 📄 schema2.sql
├── 📄 tailwind.config.ts
└── ⚙️ tsconfig.json
```


## 2. Backend API Structure

API routes are located in `app/api/`.

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`

### Game APIs (Legacy/Simple)
- `GET /api/game/current`

### Versioned API (v1)
Base path: `/api/v1`

#### Gameplay Endpoints
- `GET /api/v1/games/current/round`
- `POST /api/v1/rounds/:roundId/submissions`
- `GET /api/v1/teams/me/progress`

#### Admin Endpoints
- `POST /api/v1/admin/games/start`
- `POST /api/v1/admin/games/pause`
- `POST /api/v1/admin/games/resume`
- `POST /api/v1/admin/games/end`

## 3. Request Lifecycle Example

**Endpoint:** `POST /api/v1/rounds/:roundId/submissions`

This request demonstrates the full flow through the strict layered architecture.

1.  **HTTP Request** → Received by Next.js
2.  **Route Layer (`app/api/rounds/[roundId]/submissions/route.ts`)**
    - Parses the HTTP method (`POST`).
    - Extracts `roundId` from the URL.
    - Calls the corresponding controller function (e.g., `submissionController.create`).
3.  **Controller Layer (`controllers/submissionController.ts`)**
    - Validates the request body and parameters using a validator.
    - Calls the appropriate service function (e.g., `submissionService.processSubmission`).
    - Waits for the result and formats the `Response` object to send back to the client.
4.  **Service Layer (`services/submissionService.ts`)**
    - **Orchestrates the business logic:**
        - Fetches team progress via `teamProgressRepo.get()`.
        - Checks if the team has any attempts left.
        - Evaluates the answer against the round's configuration.
        - Calls the `submissionsRepo.create()` to store the attempt.
        - If correct, calls `teamProgressRepo.completeRound()` to unlock the next round.
    - Returns a success/failure status to the controller.
5.  **Repository Layer (`lib/repositories/submissionsRepo.ts`)**
    - Constructs and executes the SQL query to insert the submission record.
    - Uses the Supabase client to interact with the database.
    - Returns the raw result data to the service layer.
6.  **Database (PostgreSQL)**
    - The `submissions` table is updated.
    - The `team_round_progress` table is updated (via another repo call).

## 4. Treasure Hunt Game Flow

### Step 1: Admin Starts Game
- **Action:** `PATCH /admin/games/:id/start`
- **System:** Updates game status from `NOT_STARTED` to `ACTIVE`.

### Step 2: Team Starts Game
- **Action:** `POST /games/:gameId/start`
- **System:**
    - Unlocks Round 1 for the team (creates entry in `team_round_progress`).
    - Starts the team's timer (records `started_at`).

### Step 3: Round Flow
1.  System shows the clue for the current location/round to the team.
2.  Team reaches the physical location.
3.  Volunteer at the location gives a code/answer.
4.  Team submits the code via the platform.

### Step 4: Submission
- **Action:** `POST /rounds/:roundId/submissions` (Flow detailed above)

### Step 5: Unlock Next Round (on Success)
- **Logic:** If the submission is correct:
    - The current round is marked as completed (`completed_at`).
    - The next round in the sequence is unlocked for the team.

### Step 6: Failure (on Incorrect Submission)
- **Logic:** If the submission is incorrect:
    - `attempt_count` in `team_round_progress` is incremented.
    - If `attempt_count` reaches the maximum limit (e.g., 3), the team is eliminated from the game.

### Step 7: Game Completion
- **Logic:** If the team successfully solves the final round (e.g., Round 3):
    - `completed_at` is set for the final round.
    - The team's total completion time is calculated (see below).
    - The team is marked as having completed the hunt.

## 5. Authentication Flow

### Login Flow
1.  User submits credentials to `POST /api/auth/login`.
2.  System validates credentials.
3.  A secure, HTTP-only session cookie is created.
4.  The cookie is attached to the response and sent to the client.

### Protected Route Flow
1.  Client makes a request to a protected route (e.g., `/api/v1/*`).
2.  **Middleware (`middleware/verifyToken.ts`)** intercepts the request.
3.  Middleware validates the session cookie.
4.  If valid, the request proceeds to the route handler.
5.  If invalid, an unauthorized error is returned.

### Admin Route Flow
1.  Request passes through `verifyToken` middleware.
2.  **Middleware (`middleware/validateAdmin.ts`)** checks if the authenticated user has admin privileges.
3.  If valid, the request proceeds to the admin route handler.

## 6. Leaderboard Logic

Ranking is determined by two metrics in the following order:
1.  **Rounds Completed (DESC):** Teams that have finished more rounds are ranked higher.
2.  **Completion Time (ASC):** For teams with the same number of rounds completed, the one with the shorter total time is ranked higher.

**Example:**
| Team | Rounds Completed | Completion Time | Rank |
| :--- | :--------------- | :-------------- | :--- |
| A    | 3                | 5 minutes       | 1    |
| B    | 3                | 6 minutes       | 2    |
| C    | 2                | 4 minutes       | 3    |

### Completion Time Calculation
No extra database column is required. The time is computed as:

`completion_time = team_end_time - team_start_time`

Where:
- `team_start_time` = `started_at` of Round 1 for the team.
- `team_end_time` = `completed_at` of the final round (e.g., Round 3) for the team.

## 7. Current Implementation Status

- **Implemented:**
    - `GET /games/current`
    - `POST /games/:gameId/start`
- **In Progress:**
    - `GET /games/current/round`
- **Remaining (for MVP Treasure Hunt):**
    - `POST /rounds/:roundId/submissions`
    - `GET /teams/me/progress`
    - Leaderboard API