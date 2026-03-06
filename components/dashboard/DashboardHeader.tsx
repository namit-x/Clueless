type Props = {
  teamName: string
  penaltyTime: number
}

export default function DashboardHeader({ teamName, penaltyTime }: Props) {
  return (
    <div className="flex items-center justify-between border-b pb-4 mb-6">
      <div>
        <h1 className="text-xl font-semibold">Team: {teamName}</h1>
        <p className="text-sm text-gray-500">
          Penalty Time: +{penaltyTime}s
        </p>
      </div>

      <button className="text-red-500 hover:underline">
        Logout
      </button>
    </div>
  )
}