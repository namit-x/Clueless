"use client";

import React from "react";

interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface State {
    hasError: boolean;
    errorMessage: string;
}

export class GameErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, errorMessage: "" };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, errorMessage: error.message };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error("[GameErrorBoundary] Caught error:", error, info.componentStack);
    }

    handleRetry = () => {
        this.setState({ hasError: false, errorMessage: "" });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="flex items-center justify-center min-h-[320px] p-8">
                    <div className="text-center max-w-[400px]">
                        <div className="w-16 h-16 mx-auto mb-5 rounded-xl bg-destructive/10 flex items-center justify-center">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <p className="text-base font-semibold mb-2">Something went wrong</p>
                        <p className="text-sm text-muted-foreground mb-6">
                            An unexpected error occurred. Please try again or contact the event organiser if the problem persists.
                        </p>
                        <button
                            onClick={this.handleRetry}
                            className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GameErrorBoundary;
