"use client";

import { Trophy, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockTeam, mockRankHistory } from "./mockData";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const RankHistoryTab = () => {
  const chartData = mockRankHistory.map((r) => ({
    name: r.round,
    rank: r.rank,
  }));

  return (
    <div className="space-y-6">
      {/* Current rank */}
      <div className="glass rounded-xl p-8 text-center">
        <Trophy className="h-10 w-10 text-primary mx-auto mb-3" />
        <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">
          Current Rank
        </p>
        <p className="font-display text-5xl font-bold text-primary neon-text">
          #{mockTeam.rank}
        </p>
      </div>

      {/* Rank table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Round
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Rank
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Movement
                </th>
              </tr>
            </thead>
            <tbody>
              {mockRankHistory.map((r, i) => (
                <tr
                  key={i}
                  className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{r.round}</td>
                  <td className="px-4 py-3 font-display font-bold">
                    #{r.rank}
                  </td>
                  <td className="px-4 py-3">
                    {r.movement === null ? (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Minus className="h-3 w-3" /> —
                      </span>
                    ) : r.movement > 0 ? (
                      <span className="flex items-center gap-1 text-green-400">
                        <ArrowUp className="h-3 w-3" /> ↑{r.movement}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-destructive">
                        <ArrowDown className="h-3 w-3" /> ↓
                        {Math.abs(r.movement)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart */}
      <div className="glass rounded-xl p-6">
        <h3 className="font-display text-sm font-semibold tracking-wider uppercase mb-4">
          Rank Progression
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(220 15% 18%)"
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }}
              />
              <YAxis
                reversed
                domain={[1, 10]}
                tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(220 20% 8%)",
                  border: "1px solid hsl(220 15% 18%)",
                  borderRadius: 8,
                  color: "hsl(210 40% 95%)",
                }}
              />
              <Line
                type="monotone"
                dataKey="rank"
                stroke="hsl(190 100% 50%)"
                strokeWidth={2}
                dot={{ fill: "hsl(190 100% 50%)", r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RankHistoryTab;