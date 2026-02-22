// app/(app)/layout.tsx

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background gradient-bg">
      {children}
    </div>
  );
}