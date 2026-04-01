import { NextResponse } from "next/server";
import { FEATURES, type FeatureKey } from "@/lib/features";

/**
 * Call at the top of any API route handler to enforce feature flags.
 * Returns a 403 NextResponse if the feature is disabled, or null if allowed.
 *
 * Usage:
 *   const blocked = guardFeature("GAMES");
 *   if (blocked) return blocked;
 */
export function guardFeature(feature: FeatureKey): NextResponse | null {
    if (!FEATURES[feature]) {
        return NextResponse.json(
            { error: "This feature is not available yet." },
            { status: 403 }
        );
    }
    return null;
}
