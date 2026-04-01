/**
 * Centralized feature flags for partial deployment.
 * Set a flag to `true` to enable the feature, `false` to block it.
 */
export const FEATURES = {
  LOGIN: false,
  DASHBOARD: false,
  GAMES: false,
  ADMIN: false,
  LOGOUT: false,
} as const;

export type FeatureKey = keyof typeof FEATURES;

export function isFeatureEnabled(key: FeatureKey): boolean {
  return FEATURES[key];
}
