export default function TeamBlockedScreen() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-background atmosphere-low text-foreground">
      <div className="text-center space-y-4 glass rounded-2xl px-10 py-8 max-w-md">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--destructive))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h1 className="font-display text-2xl font-bold text-destructive">
          Team Access Blocked
        </h1>
        <p className="text-muted-foreground">
          Your team has been blocked by the event admin.
        </p>
        <p className="text-sm text-muted-foreground/60">
          Please contact the organizers for assistance.
        </p>
      </div>
    </div>
  );
}
