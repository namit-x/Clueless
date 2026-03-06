import {useRouter} from "next/navigation";


type Props = {
  teamName: string
  penaltyTime: number
}


export default function DashboardHeader({ teamName, penaltyTime }: Props) {
  const router = useRouter();
  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/");
  };
  return (
    <div className="flex items-center justify-between border-b pb-4 mb-6">
      <div>
        <h1 className="text-xl font-semibold">Team: {teamName}</h1>
        <p className="text-sm text-gray-500">
          Penalty Time: +{penaltyTime}s
        </p>
      </div>

      <button onClick={logout} className="text-red-500 hover:underline">
        Logout
      </button>
    </div>
  )
}