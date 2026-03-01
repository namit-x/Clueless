import { Users, CheckCircle, Ban, Gamepad2 } from "lucide-react";
import { teams, type GameStatus } from "./mockData";

type ApprovalStatus = "Approved" | "Pending" | "Rejected";

const gameStatus: GameStatus = "Running";

const stats = [
  {
    label: "Total Teams",
    value: teams.length,
    icon: Users,
    color: "text-cyan-400",
  },
  {
    label: "Approved Teams",
    value: teams.filter((t) => t.approval === "Approved").length,
    icon: CheckCircle,
    color: "text-emerald-400",
  },
  {
    label: "Blocked Teams",
    value: teams.filter((t) => t.access === "Blocked").length,
    icon: Ban,
    color: "text-red-400",
  },
  {
    label: "Game Status",
    value: gameStatus,
    icon: Gamepad2,
    color: "text-[#8fff00]",
  },
];

export default function OverviewTab() {
  const recent = [...teams].reverse().slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;

          return (
            <div key={s.label} className="glass rounded-xl p-5">
              <div className="flex items-center gap-4">
                <div className={`rounded-lg bg-muted p-2.5 ${s.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {s.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Registrations */}
      <div className="glass rounded-xl p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Recent Registrations
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-3 pr-4">Team Name</th>
                <th className="pb-3 pr-4">Leader Email</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Created At</th>
              </tr>
            </thead>

            <tbody>
              {recent.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-border/50 transition-colors hover:bg-muted/30"
                >
                  <td className="py-3 pr-4 font-medium text-foreground">
                    {t.name}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {t.leaderEmail}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={t.approval} />
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {t.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ApprovalStatus }) {
  const styles: Record<ApprovalStatus, string> = {
    Approved:
      "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    Pending:
      "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    Rejected:
      "bg-red-500/15 text-red-400 border-red-500/30",
  };

  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}