import { Clock, Target, Zap, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockPerformance } from "./mockData";

const statusStyle = {
  Completed: "text-green-400",
  Failed: "text-destructive",
  "Not Attempted": "text-muted-foreground",
};

const stats = [
  { label: "Rounds Attempted", value: mockPerformance.roundsAttempted, icon: Target },
  { label: "Rounds Cleared", value: mockPerformance.roundsCleared, icon: Zap },
  { label: "Fastest Time", value: mockPerformance.fastestTime, icon: Clock },
  { label: "Average Time", value: mockPerformance.averageTime, icon: Timer },
];

const PerformanceTab = () => (
  <div className="space-y-6">
    {/* Stat cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <div key={label} className="glass rounded-xl p-4 text-center">
          <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
          <p className="font-display text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </div>
      ))}
    </div>

    {/* Table */}
    <div className="glass rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 font-medium text-muted-foreground">Round</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Time</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Attempts</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Qualified</th>
            </tr>
          </thead>
          <tbody>
            {mockPerformance.rounds.map((r, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className={cn("px-4 py-3", statusStyle[r.status])}>{r.status}</td>
                <td className="px-4 py-3 font-mono">{r.time}</td>
                <td className="px-4 py-3">{r.attempts}</td>
                <td className="px-4 py-3">
                  {r.qualified ? (
                    <span className="text-green-400">Yes</span>
                  ) : (
                    <span className="text-muted-foreground">No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default PerformanceTab;