const DetectiveGhost = ({ className = "" }: { className?: string }) => {
    return (
        <div className={`pointer-events-none ghost-float ${className}`}>
            <svg
                className="w-[110px] h-[110px] lg:w-[250px] lg:h-[250px]"
                style={{ transform: "scaleX(-1)" }}
                viewBox="0 0 160 160"
                fill="none"
            >
                {/* ghost body */}
                <path
                    d="M40 72C40 42 58 28 80 28s40 14 40 44v34
             l-8-6-8 6-8-6-8 6-8-6-8 6V72Z"
                    className="fill-red-500/90"
                    style={{ filter: "drop-shadow(0 0 12px rgba(244,63,94,0.5))" }}
                />

                {/* eyes */}
                <g className="detective-eyes">
                    <ellipse cx="70" cy="65" rx="4" ry="6" fill="white" />
                    <ellipse cx="88" cy="65" rx="4" ry="6" fill="white" />

                    <g className="detective-pupils">
                        <circle cx="69" cy="66" r="1.5" fill="#111" />
                        <circle cx="87" cy="66" r="1.5" fill="#111" />
                    </g>
                </g>
                {/* animated magnifying glass group */}
                <g className="magnify-scan">
                    {/* magnifying glass handle */}
                    <line
                        x1="112"
                        y1="92"
                        x2="128"
                        y2="108"
                        stroke="#94a3b8"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />

                    {/* magnifying glass ring */}
                    <circle
                        cx="104"
                        cy="84"
                        r="14"
                        stroke="white"
                        strokeWidth="4"
                        fill="rgba(244,63,94,0.5)"
                    />

                    {/* arm */}
                    <path
                        d="M96 82C102 80 106 80 110 84"
                        stroke="#67e8f9"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                </g>
            </svg>
        </div>
    );
};

export default DetectiveGhost;