export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background atmosphere-low relative">
      {/* Subtle vignette for competitive focus */}
      <div className="fixed inset-0 focus-vignette z-0" aria-hidden="true" />
      <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}