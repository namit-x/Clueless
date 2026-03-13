export type GameState = "NOT_STARTED" | "ACTIVE" | "PAUSED" | "ENDED";

export interface GameCardData {
  id: string;
  name: string;
  // order_index: number;
  state: GameState;

  // time_taken_seconds?: number;
  // reward_word_earned?: boolean;
}

export interface TeamDashboardInfo {
  name: string;
  // penalty_time_seconds: number;
}

export interface TeamDashboardData {
  name: string;
}


export interface DashboardResponse {
  team: TeamDashboardInfo;
  games: GameCardData[];
}

