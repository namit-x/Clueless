"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Lock, Users } from "lucide-react";
import { mockTeam } from "./mockData";
import PasswordInput from "@/components/PasswordInput";
import { toast } from "@/hooks/use-toast";

const AccountTab = () => {
  const router = useRouter();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw || !newPw) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setCurrentPw("");
      setNewPw("");
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-lg">
      {/* Team Details */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-display text-sm font-semibold tracking-wider uppercase">
            Team Details
          </h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Team Name</span>
            <span className="font-medium">{mockTeam.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Members</span>
            <span>{mockTeam.members.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="text-green-400">{mockTeam.status}</span>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <form
        onSubmit={handleChangePassword}
        className="glass rounded-xl p-6 space-y-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-5 w-5 text-secondary" />
          <h3 className="font-display text-sm font-semibold tracking-wider uppercase">
            Change Password
          </h3>
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">
            Current Password
          </label>
          <PasswordInput
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            placeholder="Enter current password"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">
            New Password
          </label>
          <PasswordInput
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            placeholder="Enter new password"
          />
        </div>
        <button
          type="submit"
          disabled={saving || !currentPw || !newPw}
          className="w-full py-2.5 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Update Password"}
        </button>
      </form>

      {/* Logout */}
      <button
        onClick={() => router.push("/login")}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </div>
  );
};

export default AccountTab;