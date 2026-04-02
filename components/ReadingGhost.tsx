const ReadingGhost = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`pointer-events-none reading-ghost ${className}`}>
      <svg
        className="w-[110px] h-[110px] lg:w-[250px] lg:h-[250px]"
        viewBox="0 0 140 140"
        fill="none"
      >
        {/* ghost body */}
        <path
          d="M35 65C35 40 50 28 70 28s35 12 35 37v30
             l-6-4-8 6-8-6-8 6-8-6-10 8V65Z"
          className="fill-white/90"
          style={{ filter: "drop-shadow(0 0 10px rgba(34,211,238,0.45))" }}
        />

        {/* eyes */}
        <g className="ghost-eyes">
          {/* eyeballs */}
          <ellipse cx="60" cy="60" rx="4" ry="6" fill="black" />
          <ellipse cx="78" cy="60" rx="4" ry="6" fill="black" />

          {/* pupils (animated) */}
          <g className="ghost-pupils">
            <circle cx="60" cy="60" r="1.5" fill="#fff" />
            <circle cx="78" cy="60" r="1.5" fill="#fff" />
          </g>
        </g>

        {/* little paper */}
        <g className="ghost-paper">
          <rect
            x="88"
            y="74"
            width="24"
            height="18"
            rx="2"
            className="fill-black/90"
          />
          <line x1="93" y1="80" x2="107" y2="80" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="93" y1="85" x2="104" y2="85" stroke="#94a3b8" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
};

export default ReadingGhost;