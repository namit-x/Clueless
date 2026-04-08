import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6">
            <div className="text-center max-w-[420px]">
                <div className="text-7xl font-bold text-primary/20 mb-4 select-none">404</div>
                <h1 className="text-xl font-semibold mb-2">Page not found</h1>
                <p className="text-sm text-muted-foreground mb-8">
                    The page you are looking for does not exist or has been moved.
                </p>
                <Link
                    href="/dashboard"
                    className="px-5 py-2.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    Go to Dashboard
                </Link>
            </div>
        </div>
    );
}
