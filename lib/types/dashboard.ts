export type GameState = "COMPLETED" | "ACTIVE" | "LOCKED";

export interface GameCardData {
  id: number;
  name: string;
  order_index: number;

  state: GameState;

  time_taken_seconds?: number;
  reward_word_earned?: boolean;
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
  // games: GameCardData[];
}

