/**
 * Centralized feature flags for partial deployment.
 * In production, individual flags control access.
 * In development, all features are enabled for full access.
 */
// const isDev = process.env.NODE_ENV !== "production";

const RESTRICT_MODE = process.env.RESTRICT_MODE === "true";

export const FEATURES = {
  LOGIN: !RESTRICT_MODE,
  DASHBOARD: !RESTRICT_MODE,
  GAMES: !RESTRICT_MODE,
  ADMIN: !RESTRICT_MODE,
  LOGOUT: !RESTRICT_MODE,
} as const;

export type FeatureKey = keyof typeof FEATURES;

export function isFeatureEnabled(key: FeatureKey): boolean {
  return FEATURES[key];
}
