export type TeamGameState = "COMPLETED" | "FAILED" | "TIME_OVER" | "IN_PROGRESS";

export type MessageCode =
  | "GAME_COMPLETED"
  | "GAME_FAILED"
  | "GAME_TIME_OVER"
  | "GAME_IN_PROGRESS"
  | "ROUND_ACTIVE"
  | "ROUND_COMPLETED";

export interface ResolvedTeamState {
  teamState: TeamGameState;
  messageCode: MessageCode;
}
