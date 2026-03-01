"use client";

import { useState } from "react";
import {
  Search,
  Trash2,
  Eye,
  ShieldCheck,
  ShieldX,
  Ban,
  Unlock,
} from "lucide-react";

import {
  teams as initialTeams,
  type Team,
  type TeamStatus,
} from "./mockData";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Filter = "All" | TeamStatus;
type ApprovalStatus = "Approved" | "Pending" | "Rejected";
type AccessStatus = "Active" | "Blocked";

export default function TeamsTab() {
  const [teamList, setTeamList] = useState<Team[]>(initialTeams);
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<Filter>("All");
  const [viewTeam, setViewTeam] = useState<Team | null>(null);

  const filtered = teamList.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.leaderEmail.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "All" || t.approval === filter;

    return matchSearch && matchFilter;
  });

  const updateTeam = (id: string, patch: Partial<Team>) =>
    setTeamList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
    );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {(["All", "Approved", "Pending", "Rejected"] as Filter[]).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f
                    ? "bg-[#8fff00]/15 text-[#8fff00]"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {f}
              </button>
            )
          )}
        </div>

        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-muted/50 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#8fff00]/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass overflow-x-auto rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="p-4">Team</th>
              <th className="p-4">Leader Email</th>
              <th className="p-4">Size</th>
              <th className="p-4">Approval</th>
              <th className="p-4">Access</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((t) => (
              <tr
                key={t.id}
                className="border-b border-border/50 transition-colors hover:bg-muted/30"
              >
                <td className="p-4 font-medium text-foreground">
                  {t.name}
                </td>

                <td className="p-4 text-muted-foreground">
                  {t.leaderEmail}
                </td>

                <td className="p-4 text-muted-foreground">
                  {t.size}
                </td>

                <td className="p-4">
                  <ApprovalBadge status={t.approval} />
                </td>

                <td className="p-4">
                  <AccessBadge status={t.access} />
                </td>

                <td className="p-4">
                  <div className="flex items-center justify-end gap-1">
                    <IconBtn
                      title="Approve"
                      onClick={() =>
                        updateTeam(t.id, { approval: "Approved" })
                      }
                    >
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    </IconBtn>

                    <IconBtn
                      title="Reject"
                      onClick={() =>
                        updateTeam(t.id, { approval: "Rejected" })
                      }
                    >
                      <ShieldX className="h-4 w-4 text-red-400" />
                    </IconBtn>

                    <IconBtn
                      title={
                        t.access === "Blocked"
                          ? "Unblock"
                          : "Block"
                      }
                      onClick={() =>
                        updateTeam(t.id, {
                          access:
                            t.access === "Blocked"
                              ? "Active"
                              : "Blocked",
                        })
                      }
                    >
                      {t.access === "Blocked" ? (
                        <Unlock className="h-4 w-4 text-yellow-400" />
                      ) : (
                        <Ban className="h-4 w-4 text-orange-400" />
                      )}
                    </IconBtn>

                    <IconBtn
                      title="View"
                      onClick={() => setViewTeam(t)}
                    >
                      <Eye className="h-4 w-4 text-cyan-400" />
                    </IconBtn>

                    <IconBtn
                      title="Delete"
                      onClick={() =>
                        setTeamList((p) =>
                          p.filter((x) => x.id !== t.id)
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </IconBtn>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-muted-foreground"
                >
                  No teams found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Detail Modal */}
      <Dialog
        open={!!viewTeam}
        onOpenChange={() => setViewTeam(null)}
      >
        <DialogContent className="glass-strong border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {viewTeam?.name}
            </DialogTitle>
          </DialogHeader>

          {viewTeam && (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">
                  Leader:
                </span>{" "}
                {viewTeam.leaderEmail}
              </p>

              <p>
                <span className="font-medium text-foreground">
                  Size:
                </span>{" "}
                {viewTeam.size}
              </p>

              <p>
                <span className="font-medium text-foreground">
                  Approval:
                </span>{" "}
                {viewTeam.approval}
              </p>

              <p>
                <span className="font-medium text-foreground">
                  Access:
                </span>{" "}
                {viewTeam.access}
              </p>

              <p>
                <span className="font-medium text-foreground">
                  Created:
                </span>{" "}
                {viewTeam.createdAt}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IconBtn({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="rounded-md p-1.5 transition-colors hover:bg-muted"
    >
      {children}
    </button>
  );
}

function ApprovalBadge({
  status,
}: {
  status: ApprovalStatus;
}) {
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

function AccessBadge({
  status,
}: {
  status: AccessStatus;
}) {
  const styles: Record<AccessStatus, string> = {
    Active:
      "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    Blocked:
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