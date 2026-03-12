# Project Architecture

## 1. Project Overview

This project is a multi-game event management platform for competitions (Treasure Hunt, Quiz, Blind Coding, Digit Manipulation).

**Core Responsibilities:**
- Team registration
- Game lifecycle management
- Round-based gameplay
- Submission evaluation
- Leaderboard tracking
- Admin control panel

The system is **state-driven**, meaning gameplay state is always derived from the database rather than application memory.

## 2. Technology Stack

- **Frontend:** Next.js App Router, React components, Tailwind UI
- **Backend:** Next.js API Routes, TypeScript
- **Database:** PostgreSQL (Supabase)
- **Auth:** Cookie-based session auth

## 3. Architecture Pattern: Strict Layered Backend

The project enforces a strict separation of concerns with a mandatory layered architecture:

**Route**
 ↓
**Controller**
 ↓
**Service**
 ↓
**Repository**
 ↓
**Database**

This structure is a core project rule and must be followed for all features.

## 4. Backend Layer Responsibilities

### Route Layer
- **Location:** `app/api/.../route.ts`
- **Responsibilities:**
    - HTTP method handling (GET, POST, etc.)
    - Request forwarding to the appropriate controller
    - **No business logic allowed.**

### Controller Layer
- **Location:** `controllers/` (e.g., `gameController.ts`, `submissionController.ts`)
- **Responsibilities:**
    - Parse and validate incoming requests
    - Call the appropriate service layer functions
    - Format and send HTTP responses
    - **Must never access the database directly.**

### Service Layer
- **Location:** `services/` (e.g., `gameService.ts`, `submissionService.ts`)
- **Responsibilities:**
    - Contain core business logic and game rules
    - Orchestrate operations across multiple repositories
    - Validate submissions, unlock rounds, apply penalties, calculate leaderboards
    - **Orchestrates data, but does not query the database directly.**

### Repository Layer
- **Location:** `lib/repositories/` (e.g., `gameRepo.ts`, `teamsRepo.ts`)
- **Responsibilities:**
    - Execute all database queries (via Supabase)
    - Return structured data to the service layer
    - **This is the only layer that interacts with the database.**

## 5. Key Design Strengths

- **Deterministic State:** All gameplay state is stored in the database, ensuring consistency and reliability.
- **Config-Driven Gameplay:** Game rounds and rules are defined using JSON configuration, making the system flexible and extensible.
- **Concurrency Safety:** Database constraints (like unique keys) prevent data corruption from simultaneous requests.
- **Scalable Routing:** Predefined routes prevent physical crowding and ensure a fair distribution of teams during treasure hunts.
- **Clean Separation of Concerns:** The strict layered architecture improves code maintainability, testability, and readability.