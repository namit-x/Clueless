"use client";

import { useEffect, useState, useCallback } from "react";

export default function RegistrationToggle() {
    const [enabled, setEnabled] = useState<boolean | null>(null);
    const [envOverride, setEnvOverride] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch("/api/v1/admin/registration", {
                credentials: "include",
            });
            const data = await res.json();
            if (res.ok) {
                setEnabled(data.registration_enabled);
                setEnvOverride(data.env_override ?? false);
            }
        } catch {
            setError("Failed to load registration status");
        }
    }, []);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    async function handleToggle() {
        if (enabled === null || isToggling) return;

        const newValue = !enabled;
        setIsToggling(true);
        setError(null);

        try {
            const res = await fetch("/api/v1/admin/registration", {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabled: newValue }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Toggle failed");
            }

            setEnabled(data.registration_enabled);
        } catch (err: any) {
            setError(err.message);
            // Refetch to stay in sync
            await fetchStatus();
        } finally {
            setIsToggling(false);
        }
    }

    if (enabled === null && !error) {
        return (
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-4 h-4 border-2 border-gray-600 border-t-gray-300 rounded-full animate-spin" />
                Loading registration status...
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-5">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base font-medium text-white">
                        Team Registration
                    </h3>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {enabled
                            ? "New teams can register on the site."
                            : "Registration is closed. No new teams can sign up."}
                    </p>
                </div>

                <button
                    onClick={handleToggle}
                    disabled={isToggling || envOverride}
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                        enabled
                            ? "bg-green-500 focus:ring-green-500"
                            : "bg-gray-600 focus:ring-gray-500"
                    } ${isToggling || envOverride ? "opacity-50 cursor-not-allowed" : ""}`}
                    aria-label="Toggle registration"
                >
                    <span
                        className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                            enabled ? "translate-x-5" : "translate-x-0"
                        }`}
                    />
                </button>
            </div>

            {envOverride && (
                <p className="mt-3 text-sm text-amber-400">
                    Registrations are blocked by an environment-level kill switch (REGISTRATION_ENABLED=false). This toggle has no effect until the env variable is changed.
                </p>
            )}

            {error && (
                <p className="mt-3 text-sm text-red-400">{error}</p>
            )}
        </div>
    );
}
