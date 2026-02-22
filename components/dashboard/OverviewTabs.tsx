"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Users, Zap, Trophy, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockTeam, mockEvent } from "./mockData";

const statusColors = {
  Active: "bg-green-500/20 text-green-400 border-green-500/30",
  Eliminated: "bg-destructive/20 text-destructive border-destructive/30",
  Completed: "bg-primary/20 text-primary border-primary/30",
};

const roundStatusColors = {
  Live: "bg-green-500/20 text-green-400",
  Waiting: "bg-yellow-500/20 text-yellow-400",
  Locked: "bg-destructive/20 text-destructive",
  Completed: "bg-primary/20 text-primary",
};

const OverviewTab = () => {
  const [membersOpen, setMembersOpen] = useState(false);

  const isEliminated = mockTeam.status === "Eliminated";
  const canEnter = mockEvent.roundStatus === "Live" && !isEliminated;

  const buttonLabel =
    isEliminated ? "Eliminated" :
    mockEvent.roundStatus === "Waiting" ? "Waiting for Round to Start" :
    mockEvent.roundStatus === "Completed" ? "Event Completed" :
    mockEvent.roundStatus === "Locked" ? "Round Locked" :
    "Enter Game Arena";

  return (
    <div className="space-y-6">
      {/* Team Identity */}
      <div className="glass rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-bold tracking-wide">
                {mockTeam.name}
              </h2>
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                  statusColors[mockTeam.status]
                )}
              >
                {mockTeam.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Team of {mockTeam.members.length} members
            </p>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Current Rank
            </p>
            <p className="font-display text-4xl font-bold text-primary neon-text">
              #{mockTeam.rank}
            </p>
          </div>
        </div>

        {/* Collapsible members */}
        <button
          onClick={() => setMembersOpen(!membersOpen)}
          className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {membersOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          {membersOpen ? "Hide" : "Show"} Team Members
        </button>

        {membersOpen && (
          <div className="mt-3 space-y-2">
            {mockTeam.members.map((m, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-muted/30 rounded-lg px-4 py-2.5 text-sm"
              >
                <div>
                  <span className="font-medium">{m.name}</span>
                  <span className="text-muted-foreground ml-2 text-xs">
                    ({m.role})
                  </span>
                </div>
                <span className="text-muted-foreground text-xs hidden sm:inline">
                  {m.department}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Status */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-secondary" />
          <h3 className="font-display text-sm font-semibold tracking-wider uppercase">
            Event Status
          </h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Current Round
            </span>
            <span className="font-medium">
              Round {mockEvent.currentRound} – {mockEvent.roundName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Round Status
            </span>
            <span
              className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-medium",
                roundStatusColors[mockEvent.roundStatus]
              )}
            >
              {mockEvent.roundStatus}
            </span>
          </div>
          <p className="text-sm text-muted-foreground pt-2 border-t border-border">
            {isEliminated
              ? `You were eliminated in Round ${mockEvent.currentRound}.`
              : mockEvent.qualificationMessage}
          </p>
        </div>
      </div>

      {/* Enter Game Arena */}
      <div className="glass rounded-xl p-6 text-center">
        <Gamepad2 className="h-8 w-8 text-primary mx-auto mb-3" />
        <h3 className="font-display text-lg font-bold mb-2">
          Game Arena
        </h3>
        <p className="text-sm text-muted-foreground mb-5">
          {canEnter
            ? "Your round is live. Enter and compete!"
            : buttonLabel}
        </p>
        <button
          disabled={!canEnter}
          className={cn(
            "px-8 py-3 rounded-lg font-display text-sm font-semibold tracking-wider transition-all duration-300",
            canEnter
              ? "bg-primary text-primary-foreground neon-glow hover:neon-glow-strong"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
};

export default OverviewTab;