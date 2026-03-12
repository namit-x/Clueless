# Database Schema

This document outlines the core database tables for the multi-game event platform.

## Core Tables

### Teams
Stores information about each registered team.

| column     | purpose                 |
| :--------- | :---------------------- |
| `team_id`  | Unique team id          |
| `team_name`| Team name               |
| `team_size`| Number of members       |
| `owner_id` | Team creator (user id)  |

### Members
Stores individual members within a team.

| column       | purpose                    |
| :----------- | :------------------------- |
| `member_id`  | Unique member id           |
| `team_id`    | Foreign key to `teams`     |
| `name`       | Participant name           |
| `mobile`     | Contact number             |
| `email`      | Email address              |
| `branch`     | Department/Branch of study |
| `is_leader`  | Boolean, is this the leader? |

### Games
Represents each distinct event (e.g., Treasure Hunt, Quiz).

| column        | purpose                                                       |
| :------------ | :------------------------------------------------------------ |
| `id`          | Unique game id                                                |
| `name`        | Game name                                                     |
| `order_index` | Display order in the event                                    |
| `status`      | `NOT_STARTED` / `ACTIVE` / `PAUSED` / `ENDED`                 |
| `started_at`  | Timestamp when game started                                   |
| `paused_at`   | Timestamp when game was paused                                |
| `resumed_at`  | Timestamp when game was resumed                               |
| `ended_at`    | Timestamp when game ended                                     |

**State Transition Rules:**
`NOT_STARTED` → `ACTIVE` → `PAUSED` ⇄ `ACTIVE` → `ENDED`

### Rounds
Represents the rounds within a game.

| column         | purpose                             |
| :------------- | :---------------------------------- |
| `id`           | Unique round id                     |
| `game_id`      | Foreign key to `games`              |
| `round_number` | The sequence number of the round    |
| `configuration`| JSON column storing dynamic game logic and rules for the round |

### Team Round Progress
Tracks each team's status and progress through the rounds of a game.

| column          | purpose                                   |
| :-------------- | :---------------------------------------- |
| `team_id`       | Foreign key to `teams`                    |
| `round_id`      | Foreign key to `rounds`                   |
| `status`        | Current state for the team in this round  |
| `attempt_count` | Number of wrong attempts made             |
| `started_at`    | Timestamp when the team started the round |
| `completed_at`  | Timestamp when the team finished the round|

**Constraint:** `UNIQUE(team_id, round_id)` - Ensures one record per team per round.

### Submissions
Stores every answer attempt made by a team for a round.

| column              | purpose                         |
| :------------------ | :------------------------------ |
| `team_id`           | Foreign key to `teams`          |
| `round_id`          | Foreign key to `rounds`         |
| `submitted_answer`  | The answer provided by the team |
| `is_correct`        | Boolean, was the answer right?  |
| `evaluation_result` | Explanation or result message   |
| `submitted_at`      | Timestamp of submission         |

### Reward Words
Stores words collected by teams across different games to form a final sentence.

| column    | purpose                        |
| :-------- | :----------------------------- |
| `team_id` | Foreign key to `teams`         |
| `game_id` | Foreign key to `games`         |
| `word`    | The reward word collected      |

**Constraint:** `UNIQUE(team_id, game_id)` - Ensures one word per team per game.

### Final Submissions
Stores the final puzzle sentence submitted by a team.

- `final_submissions`

### Admin Logs
Audit log for all administrative actions.

- `admin_logs` (e.g., game start, pause, resume, end, round unlock, penalty application)

---

## Treasure Hunt Specific Schema

### Routes
Predefined paths for the treasure hunt.

| column | purpose            |
| :----- | :----------------- |
| `id`   | Unique route id    |
| `name` | Route name (e.g., "Route 1", "Route A") |

### Route Locations
Defines the sequence of locations and clues for a specific route.

| column         | purpose                                     |
| :------------- | :------------------------------------------ |
| `route_id`     | Foreign key to `routes`                     |
| `round_number` | The order of this location on the route (1, 2, 3) |
| `location_id`  | ID of the physical location                 |
| `clue`         | The riddle or clue for the team             |
| `correct_answer` | The code/answer the volunteer expects       |

**Constraint:** `UNIQUE(route_id, round_number)` - Ensures a fixed, ordered set of locations per route.

### Team Routes
Assigns a single, unique route to each team for the treasure hunt.

| column    | purpose                     |
| :-------- | :-------------------------- |
| `team_id` | Foreign key to `teams`      |
| `route_id`| Foreign key to `routes`     |

**Constraint:** `UNIQUE(team_id)` - Guarantees each team gets exactly one route.

**Example Dataset Calculation:**
- 12 Locations
- 60 Routes
- 3 Rounds per Route
- `route_locations` rows = 60 routes × 3 rounds = 180