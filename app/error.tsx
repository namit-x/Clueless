"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[GlobalError]", error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6">
            <div className="text-center max-w-[420px]">
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>
                <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
                <p className="text-sm text-muted-foreground mb-8">
                    An unexpected error occurred. Please try again or contact the event organiser if the problem persists.
                </p>
                <button
                    onClick={reset}
                    className="px-5 py-2.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}
