import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { clearUser } from "@/store/slices/authSlice";

type Props = {
  teamName: string;
};

export default function DashboardHeader({ teamName }: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    dispatch(clearUser());
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <div className="relative flex items-center justify-between pb-6 mb-2 border-b border-white/[0.06]">
      {/* Left Home */}
      <button
        onClick={() => router.push("/")}
        className="
          group relative flex items-center gap-2 px-4 py-2.5 rounded-xl
          bg-white/[0.04] border border-white/[0.08]
          text-white/50 text-sm font-medium tracking-wide
          transition-all duration-200 ease-out
          hover:bg-white/[0.08] hover:border-white/[0.14] hover:text-white/80
          hover:shadow-[0_0_20px_rgba(255,255,255,0.03)]
          active:scale-[0.97] active:duration-100
        "
      >
        <svg
          className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
        </svg>
        Home
      </button>

      {/* Center Team Name */}
      <div className="absolute left-1/2 -translate-x-1/2 text-center">
        <div className="flex items-center gap-2.5">
          {/* Team avatar circle */}
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-primary text-sm font-bold">
              {teamName?.charAt(0)?.toUpperCase() || "T"}
            </span>
          </div>
          <div className="text-left">
            <p className="text-[11px] uppercase tracking-[0.15em] text-white/25 font-medium leading-none mb-1">
              Team
            </p>
            <h1 className="font-display text-lg font-semibold text-white/90 leading-none tracking-tight">
              {teamName}
            </h1>
          </div>
        </div>
      </div>

      {/* Right Logout */}
      <button
        onClick={logout}
        className="
          group relative flex items-center gap-2 px-4 py-2.5 rounded-xl
          bg-red-500/[0.06] border border-red-500/[0.12]
          text-red-400/60 text-sm font-medium tracking-wide
          transition-all duration-200 ease-out
          hover:bg-red-500/[0.12] hover:border-red-500/[0.22] hover:text-red-400/90
          hover:shadow-[0_0_20px_rgba(239,68,68,0.06)]
          active:scale-[0.97] active:duration-100
        "
      >
        Logout
        <svg
          className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
        </svg>
      </button>
    </div>
  );
}