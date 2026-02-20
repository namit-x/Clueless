import { ReactNode } from "react";

interface AuthLayoutProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
}

const AuthLayout = ({ leftContent, rightContent }: AuthLayoutProps) => (
  <div className="min-h-screen bg-background gradient-bg grid-pattern flex flex-col lg:flex-row">
    {/* Left Branding Panel */}
    <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      <div className="relative z-10 max-w-md w-full">{leftContent}</div>
    </div>

    {/* Right Form Panel */}
    <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-16">
      <div className="w-full max-w-lg">{rightContent}</div>
    </div>
  </div>
);

export default AuthLayout;
