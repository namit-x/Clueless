# File Tree: Clueless

**Generated:** 3/15/2026, 2:02:15 AM
**Root Path:** `/D/GH_CodeArena/GitRepos/Clueless`

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
│   │   │   ├── 📁 register
│   │   │   │   └── 📄 route.ts
│   │   │   └── 📁 session
│   │   │       └── 📁 stream
│   │   │           └── 📄 route.ts
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
│   │   ├── 📁 AdminLogs
│   │   │   └── 📄 AdminLogsPanel.tsx
│   │   ├── 📁 GameControl
│   │   │   ├── 📄 GameCard.tsx
│   │   │   └── 📄 GameControlPanel.tsx
│   │   ├── 📁 TeamControl
│   │   │   └── 📄 TeamControlPanel.tsx
│   │   ├── 📁 TeamProgress
│   │   │   └── 📄 TeamProgressPanel.tsx
│   │   └── 📄 AdminSidebar.tsx
│   ├── 📁 dashboard
│   │   ├── 📄 DashboardHeader.tsx
│   │   ├── 📄 GameCard.tsx
│   │   ├── 📄 GameGrid.tsx
│   │   └── 📄 mockData.ts
│   ├── 📁 game
│   │   ├── 📄 GameHeader.tsx
│   │   └── 📄 GameLayout.tsx
│   ├── 📁 games
│   │   ├── 📁 blind-code
│   │   │   └── 📄 BlindCodeGame.tsx
│   │   ├── 📁 digit-manipulation
│   │   │   └── 📄 DigitManipulationGame.tsx
│   │   ├── 📁 quiz
│   │   │   └── 📄 QuizGame.tsx
│   │   └── 📁 treasure-hunt
│   │       └── 📄 TreasureHuntGame.tsx
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
│   ├── 📄 sessionController.ts
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
│   │   ├── 📄 sessionRepo.ts
│   │   ├── 📄 submissionsRepo.ts
│   │   ├── 📄 teamProgressRepo.ts
│   │   ├── 📄 teamRoundProgressRepo.ts
│   │   ├── 📄 teamRoutesRepo.ts
│   │   └── 📄 teamsRepo.ts
│   ├── 📁 supabase
│   │   ├── 📄 client.ts
│   │   └── 📄 server.ts
│   ├── 📁 types
│   │   ├── 📄 adminGames.ts
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
│   ├── 📄 sessionService.ts
│   └── 📄 submissionService.ts
├── 📁 supabase
│   ├── 📁 migrations
│   │   ├── 📄 20260309120611_remote_schema.sql
│   │   ├── 📄 20260309121247_treasure_hunt_tables.sql
│   │   └── 📄 20260312130000_add_session_columns.sql
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
├── 📝 Backend_Architecture.md
├── 📝 DATABASE_SCHEMA.md
├── 📝 EXECUTION_FLOW.md
├── 📝 GAME_ENGINE.md
├── 📝 RULES.md
├── ⚙️ components.json
├── 📝 endpoint.md
├── 📄 eslint.config.mjs
├── 📄 next.config.ts
├── ⚙️ package-lock.json
├── ⚙️ package.json
├── 📄 postcss.config.js
├── 📄 schema.sql
├── 📄 supabase_schema.sql
├── 📄 tailwind.config.ts
└── ⚙️ tsconfig.json
```

---
*Generated by FileTree Pro Extension*