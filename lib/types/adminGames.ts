export type AdminGameStatus = "pending" | "running" | "paused" | "ended";

export type AdminGame = {
  id: string;
  name: string;
  order_index: number;
  status: AdminGameStatus;
  started_at?: string | null;
  paused_at?: string | null;
  resumed_at?: string | null;
  ended_at?: string | null;
};