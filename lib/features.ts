/**
 * Centralized feature flags for partial deployment.
 *
 * RESTRICT_MODE=true  → all features disabled (pre-event lockdown)
 * RESTRICT_MODE=false → all features enabled
 * Development (NODE_ENV !== "production") → all features always enabled
 */
const isDev = process.env.NODE_ENV !== "production";
const isRestricted = process.env.RESTRICT_MODE === "true";

const open = isDev || !isRestricted;

export const FEATURES: Record<string, boolean> = {
  LOGIN: open,
  DASHBOARD: open,
  GAMES: open,
  ADMIN: open,
  LOGOUT: open,
};

export type FeatureKey = keyof typeof FEATURES;

export function isFeatureEnabled(key: FeatureKey): boolean {
  return FEATURES[key];
}
