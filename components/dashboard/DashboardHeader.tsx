import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { clearUser } from "@/store/slices/authSlice";

type Props = {
  teamName: string
  // penaltyTime: number
}


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
    <div className="relative mb-6 flex items-center border-b pb-4">

      {/* Left Home */}
      <button
        onClick={() => router.push("/")}
        className="rounded-md border border-gray-400 px-4 py-2 text-gray-300 transition hover:bg-blue-500/10 hover:text-blue-200"
      >
        Home
      </button>

      {/* Center Team Name */}
      <div className="absolute left-1/2 -translate-x-1/2 text-center">
        <h1 className="text-xl font-semibold">Team: {teamName}</h1>
        <p className="text-sm text-gray-500"></p>
      </div>

      {/* Right Logout */}
      <button
        onClick={logout}
        className="ml-auto rounded-md border border-red-400 px-4 py-2 text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
      >
        Logout
      </button>

    </div>
  )
}