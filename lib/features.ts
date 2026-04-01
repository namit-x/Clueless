/**
 * Centralized feature flags for partial deployment.
 * In production, individual flags control access.
 * In development, all features are enabled for full access.
 */
const isDev = process.env.NODE_ENV !== "production";

export const FEATURES = {
  LOGIN: isDev || false,
  DASHBOARD: isDev || false,
  GAMES: isDev || false,
  ADMIN: isDev || false,
  LOGOUT: isDev || false,
} as const;

export type FeatureKey = keyof typeof FEATURES;

export function isFeatureEnabled(key: FeatureKey): boolean {
  return FEATURES[key];
}
