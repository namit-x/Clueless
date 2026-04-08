"use client";

import { useEffect, useMemo, useState } from "react";

type PenaltyAdjusterProps = {
  teamGameResultId: string;
  currentPenalty: number;
  teamName?: string;
  onUpdated?: (nextPenalty: number) => void;
};

export default function PenaltyAdjuster({
  teamGameResultId,
  currentPenalty,
  teamName,
  onUpdated,
}: PenaltyAdjusterProps) {
  const [value, setValue] = useState<string>("");
  const [displayPenalty, setDisplayPenalty] = useState(currentPenalty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setDisplayPenalty(currentPenalty);
  }, [currentPenalty]);

  const parsedValue = useMemo(() => {
    if (value.trim() === "") return null;

    const next = Number(value);
    return Number.isFinite(next) ? next : Number.NaN;
  }, [value]);

  const validationError = useMemo(() => {
    if (value.trim() === "") return "Penalty value is required.";
    if (parsedValue === null || Number.isNaN(parsedValue)) return "Penalty value must be a valid number.";
    if (!Number.isInteger(parsedValue)) return "Penalty value must be a whole number.";
    if (parsedValue <= 0) return "Penalty value must be greater than zero.";
    return null;
  }, [parsedValue, value]);

  async function updatePenalty() {
    if (loading) return;

    setError(null);
    setSuccess(null);

    if (validationError || parsedValue === null || Number.isNaN(parsedValue)) {
      setError(validationError ?? "Please fix the form before submitting.");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to update penalty?");
    if (!confirmed) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/v1/admin/team-game-results/${teamGameResultId}/penalty`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "INCREMENT",
          value: parsedValue,
          reason: "Admin manual penalty increment",
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Failed to update penalty.");
      }

      const nextPenalty = Number(json.data?.new_penalty ?? displayPenalty);

      setDisplayPenalty(nextPenalty);
      onUpdated?.(nextPenalty);
      setValue("");
      setSuccess(`Penalty updated successfully${teamName ? ` for ${teamName}` : ""}.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update penalty.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-amber-500/20 bg-gray-950/60 p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Add Penalty</h3>
          <p className="mt-1 text-sm text-gray-400">
            Current Penalty: <span className="font-medium text-amber-300">{displayPenalty} seconds</span>
          </p>
        </div>
        {teamName && (
          <span className="rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-300">
            {teamName}
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor={`penalty-value-${teamGameResultId}`} className="mb-1 block text-sm font-medium text-gray-200">
            Add Seconds
          </label>
          <input
            id={`penalty-value-${teamGameResultId}`}
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white outline-none transition focus:border-amber-400"
            placeholder="Enter seconds to add"
            disabled={loading}
          />
        </div>

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

        {!error && success && (
          <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            {success}
          </p>
        )}

        <button
          type="button"
          onClick={updatePenalty}
          disabled={loading || Boolean(validationError)}
          className="inline-flex w-full items-center justify-center rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-amber-500/50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-900/30 border-t-gray-900" />
              Updating...
            </span>
          ) : (
            "Add Time"
          )}
        </button>
      </div>
    </section>
  );
}
