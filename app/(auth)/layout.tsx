// app/(auth)/layout.tsx

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background atmosphere-high relative">
      {/* Global grid overlay for auth pages */}
      <div
        className="fixed inset-0 pointer-events-none grid-pattern opacity-[0.4]"
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}