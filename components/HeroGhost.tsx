const HeroGhost = ({ className = "" }: { className?: string }) => {
  return (
    <div
      className={`z-20 pointer-events-none ghost-float ${className}`}
    >
      <svg className="w-[90px] h-[90px] lg:w-[150px] lg:h-[150px]" viewBox="0 0 120 120" fill="none">
        <path
          d="M20 55C20 30 38 16 60 16s40 14 40 39v38l-10-8-10 8-10-8-10 8-10-8-10 8V55Z"
          className="fill-cyan-400/90"
          style={{ filter: "drop-shadow(0 0 12px rgba(34,211,238,0.6))" }}
        />
        <g className="ghost-eyes">
          <ellipse cx="48" cy="52" rx="6" ry="9" fill="white" />
          <ellipse cx="72" cy="52" rx="6" ry="9" fill="white" />
          <circle cx="50" cy="54" r="2.5" fill="#111" />
          <circle cx="74" cy="54" r="2.5" fill="#111" />
        </g>
      </svg>
    </div>
  );
};

export default HeroGhost;