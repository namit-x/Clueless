type GameState = "NOT_STARTED" | "ACTIVE";

type Props = {
  name: string;
  state: GameState;
  onPlay?: () => void;
};

export default function GameCard({ name, state, onPlay }: Props) {
  return (
    <div
      className={`
        group relative rounded-2xl p-5 transition-all duration-300 ease-out overflow-hidden
        ${
          state === "ACTIVE"
            ? "bg-gradient-to-br from-white/[0.05] to-primary/[0.03] border border-primary/20 neon-glow-subtle hover:neon-glow hover:border-primary/30"
            : "bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1]"
        }
        ${state === "NOT_STARTED" ? "opacity-50" : ""}
      `}
    >
      {/* Subtle corner glow for active */}
      {state === "ACTIVE" && (
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/[0.08] rounded-full blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
      )}

      {/* Content */}
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Status badge */}
          <div className="mb-3">
            {state === "ACTIVE" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/[0.1] border border-primary/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary/90">
                  Live
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
                <span className="w-2 h-2 rounded-full bg-white/20" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/30">
                  Waiting
                </span>
              </span>
            )}
          </div>

          {/* Game name */}
          <h2
            className={`font-display text-lg font-semibold tracking-tight transition-colors duration-300 ${
              state === "ACTIVE"
                ? "text-white/90 group-hover:text-white"
                : "text-white/35"
            }`}
          >
            {name}
          </h2>

          {/* Subtitle */}
          {state === "NOT_STARTED" && (
            <p className="mt-1.5 text-sm text-white/20">
              Game not started yet
            </p>
          )}
        </div>

        {/* Play button */}
        {state === "ACTIVE" && (
          <button
            onClick={onPlay}
            className="
              group/btn relative flex items-center gap-2 px-5 py-2.5 rounded-xl
              bg-primary text-primary-foreground font-semibold text-sm tracking-wide
              neon-glow-subtle
              transition-all duration-200 ease-out
              hover:brightness-110 hover:neon-glow
              hover:scale-[1.02]
              active:scale-[0.97] active:duration-100
              self-center
            "
          >
            Play
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M6.3 2.8A1 1 0 005 3.7v12.6a1 1 0 001.3.9l10-6.3a1 1 0 000-1.8l-10-6.3z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}