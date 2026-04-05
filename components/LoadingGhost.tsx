const LoadingGhost = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-6">
            {/* Ghost */}
            <div className="relative ghost-float">
                <svg
                    className="w-24 h-24 lg:w-32 lg:h-32"
                    viewBox="0 0 120 120"
                    fill="none"
                >
                    <path
                        d="M20 55C20 30 38 16 60 16s40 14 40 39v38l-10-8-10 8-10-8-10 8-10-8-10 8V55Z"
                        className="fill-cyan-400/90"
                        style={{
                            filter: "drop-shadow(0 0 12px rgba(34,211,238,0.6))",
                        }}
                    />

                    <ellipse cx="48" cy="52" rx="6" ry="9" fill="white" />
                    <ellipse cx="72" cy="52" rx="6" ry="9" fill="white" />

                    <circle cx="50" cy="54" r="2.5" fill="#111" />
                    <circle cx="74" cy="54" r="2.5" fill="#111" />
                </svg>
            </div>

            {/* Loading Dots */}
            <div className="flex gap-2">
                <span className="loading-dot delay-0" />
                <span className="loading-dot delay-150" />
                <span className="loading-dot delay-300" />
                <span className="loading-dot delay-450" />
            </div>
        </div>
    );
};

export default LoadingGhost;