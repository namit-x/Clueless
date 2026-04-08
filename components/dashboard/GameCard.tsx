type GameState = "NOT_STARTED" | "ACTIVE";

type Props = {
  name: string;
  state: GameState;
  onPlay?: () => void;
};

export default function GameCard({ name, state, onPlay }: Props) {
  const isActive = state === "ACTIVE";

  return (
    <div
      className={`
        group relative rounded-2xl overflow-hidden h-44
        transition-all duration-300 ease-out
        ${
          isActive
            ? "bg-white/[0.04] border border-primary/25 hover:border-primary/40 hover:bg-white/[0.06] neon-glow-subtle hover:neon-glow"
            : "bg-white/[0.015] border border-white/[0.05] opacity-50"
        }
      `}
    >
      {/* Active corner glow */}
      {isActive && (
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-primary/[0.07] rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      )}

      <div className="relative z-10 p-6">
        {/* Top row: status chip + play button */}
        <div className="flex items-center justify-between mb-5">
          {/* Status chip */}
          {isActive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/[0.08] border border-primary/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-50" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary/80">
                Live
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.05]">
              <span className="w-1.5 h-1.5 rounded-full bg-white/15" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25">
                Inactive
              </span>
            </span>
          )}

          {/* Play button — only when active */}
          {isActive && (
            <button
              onClick={onPlay}
              className="
                group/btn flex items-center gap-2 px-4 py-2 rounded-lg
                bg-primary text-primary-foreground text-sm font-semibold tracking-wide
                neon-glow-subtle
                transition-all duration-200
                hover:brightness-110 hover:neon-glow hover:scale-[1.03]
                active:scale-[0.97] active:duration-100
              "
            >
              Play
              <svg
                className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5"
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

        {/* Game name */}
        <h2
          className={`font-display text-xl font-semibold tracking-tight leading-tight transition-colors duration-300 ${
            isActive ? "text-white/90 group-hover:text-white" : "text-white/30"
          }`}
        >
          {name}
        </h2>

        {/* Bottom hint for inactive */}
        {/* {!isActive && (
          <p className="mt-1.5 text-xs text-white/20 tracking-wide">
            Waiting for admin to start
          </p>
        )} */}
      </div>
    </div>
  );
}