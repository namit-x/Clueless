1\. Team Registration
=====================

| When to Call | Endpoint | Method | Body |
| --- | --- | --- | --- |
| While typing team name | `/api/team/check-name` | POST | `{ teamName }` |
| Before showing member form | `/api/team/validate` | POST | `{ teamName, teamSize }` |
| Submit full registration form | `/api/auth/register` *(or `/api/team/register`)* | POST | `{ teamName, password, teamSize, members[] }` |

### members[] structure

| Field | Type |
| --- | --- |
| name | string |
| mobile | string |
| email | string |
| branch | string |
| isLeader | boolean |

* * * * *

2\. Authentication
==================

| When to Call | Endpoint | Method | Body |
| --- | --- | --- | --- |
| Login form submit | `/api/auth/login` | POST | `{ teamName, password }` |
| Logout button | `/api/auth/logout` | POST | none |

Session is stored in **cookie automatically**.

* * * * *

3\. Session Monitoring (Single Login Protection)
================================================

| When to Call | Endpoint | Method | Notes |
| --- | --- | --- | --- |
| After login (keep connection open) | `/api/auth/session/stream` | GET | SSE stream |

Purpose: logout user if session becomes invalid.

* * * * *

4\. Gameplay --- Team Side
========================

| When to Call | Endpoint | Method | Body | Notes |
| --- | --- | --- | --- | --- |
| Enter games page | `/api/game/current` | GET | --- | Get active game |
| Player presses **Start Game** | `/api/v1/games/[gameId]/start` | POST | --- | Registers team start |
| Load current round | `/api/v1/games/current/round` | GET | --- | Returns clue |
| Submit answer | `/api/v1/rounds/[roundId]/submissions` | POST | `{ answer }` | Validate round answer |
| Show progress panel | `/api/v1/teams/me/progress` | GET | --- | Team round progress |

* * * * *

5\. Team Dashboard
==================

| When to Call | Endpoint | Method | Notes |
| --- | --- | --- | --- |
| Load dashboard page | `/api/team/dashboard` | GET | Returns mock data |

* * * * *

6\. Admin --- Games
=================

| When to Call | Endpoint | Method | Body |
| --- | --- | --- | --- |
| Create new game | `/api/admin/games` | POST | `{ name, description?, is_active? }` |
| Load games list | `/api/v1/admin/games` | GET | --- |

* * * * *

7\. Admin --- Game Controls
=========================

| Action | Endpoint | Method |
| --- | --- | --- |
| Start game | `/api/v1/admin/games/[gameId]/start` | PATCH |
| Pause game | `/api/v1/admin/games/[gameId]/pause` | PATCH |
| Resume game | `/api/v1/admin/games/[gameId]/resume` | PATCH |
| Restart game | `/api/v1/admin/games/[gameId]/restart` | PATCH |
| End game | `/api/v1/admin/games/[gameId]/end` | PATCH |

* * * * *

8\. Admin --- Team Moderation
===========================

| Action | Endpoint | Method |
| --- | --- | --- |
| View teams | `/api/v1/admin/teams` | GET |
| Approve team | `/api/v1/admin/teams/[teamId]/approve` | PATCH |
| Reject team | `/api/v1/admin/teams/[teamId]/reject` | PATCH |

* * * * *

9\. Quick Integration Order (Frontend)
======================================

| Step | API |
| --- | --- |
| Registration | `check-name → validate → register` |
| Login | `login` |
| Start gameplay | `game/current → games/:id/start` |
| Gameplay loop | `current/round → submissions` |
| Progress UI | `teams/me/progress` |