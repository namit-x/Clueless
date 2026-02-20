'use client'

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CountDown from "@/components/CountDown";


import { Lock, Trophy, Zap, UserPlus, X, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import PasswordInput from "@/components/PasswordInput";
import PasswordStrength from "@/components/PasswordStrength";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface MemberFields {
  name: string;
  email: string;
  phone?: string;
  department?: string;
}

const emptyMember = (): MemberFields => ({ name: "", email: "" });

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{10,15}$/;

const Register = () => {
  const router = useRouter();


  const [teamName, setTeamName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [members, setMembers] = useState<MemberFields[]>([
    { name: "", email: "", phone: "", department: "" },
    { name: "", email: "" },
  ]);
  const [agreed, setAgreed] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const addMember = () => {
    if (members.length < 3) setMembers([...members, emptyMember()]);
  };

  const removeMember = (idx: number) => {
    if (idx >= 2) setMembers(members.filter((_, i) => i !== idx));
  };

  const updateMember = (idx: number, field: keyof MemberFields, value: string) => {
    const updated = [...members];
    updated[idx] = { ...updated[idx], [field]: value };
    setMembers(updated);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!teamName.trim()) e.teamName = "Team name is required";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Min 6 characters";
    if (password !== confirmPassword) e.confirmPassword = "Passwords don't match";

    // Member 1 (leader)
    if (!members[0].name.trim()) e["m0_name"] = "Required";
    if (!emailRegex.test(members[0].email)) e["m0_email"] = "Invalid email";
    if (!phoneRegex.test(members[0].phone || "")) e["m0_phone"] = "Invalid phone (10-15 digits)";
    if (!members[0].department?.trim()) e["m0_dept"] = "Required";

    // Member 2
    if (!members[1].name.trim()) e["m1_name"] = "Required";
    if (!emailRegex.test(members[1].email)) e["m1_email"] = "Invalid email";

    // Member 3 (optional but validate if filled)
    if (members[2]) {
      if (members[2].name && !members[2].email) e["m2_email"] = "Email required with name";
      if (members[2].email && !emailRegex.test(members[2].email)) e["m2_email"] = "Invalid email";
    }

    if (!agreed) e.agreed = "You must agree to the rules";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => router.push("/login"), 1200);
  };

  const fieldClass = (key: string) =>
    `bg-muted/50 border-border focus:border-primary transition-colors ${errors[key] ? "border-destructive" : ""}`;

  return (
    <AuthLayout
      leftContent={
        <div className="space-y-8 animate-fade-up">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-wider neon-text leading-tight">
              AI × IoT
              <br />
              CODE ARENA 2026
            </h1>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Four Rounds. One Final Key. Only the Fastest Minds Win.
            </p>
          </div>

          <ul className="space-y-4">
            {[
              { icon: Lock, text: "4 Competitive Rounds" },
              { icon: Trophy, text: "Live Leaderboard" },
              { icon: Zap, text: "Time-Based Ranking" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-foreground/80">
                <span className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                {text}
              </li>
            ))}
          </ul>

          {/* Mock countdown */}
          <CountDown />
          {/* <div className="flex gap-4">
            {[
              { v: "12", l: "Days" },
              { v: "08", l: "Hrs" },
              { v: "45", l: "Min" },
              { v: "30", l: "Sec" },
            ].map(({ v, l }) => (
              <div key={l} className="text-center">
                <div className="font-display text-xl font-bold text-primary">{v}</div>
                <div className="text-xs text-muted-foreground">{l}</div>
              </div>
            ))}
          </div> */}

        </div>
      }


      rightContent={
        <div className="glass rounded-2xl p-6 sm:p-8 neon-glow animate-fade-up" style={{ animationDelay: "0.15s" }}>
          {success ? (
            <div className="text-center py-12 space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl">
                ✓
              </div>
              <h2 className="font-display text-xl font-bold">Registration Successful!</h2>
              <p className="text-muted-foreground">Redirecting to login…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="font-display text-xl font-bold tracking-wide text-center">Register Your Team</h2>

              {/* Section A – Team Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Team Information</h3>

                <div>
                  <Label htmlFor="teamName">Team Name *</Label>
                  <Input
                    id="teamName"
                    autoFocus
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className={fieldClass("teamName")}
                    placeholder="Enter team name"
                  />
                  {errors.teamName && <p className="text-xs text-destructive mt-1">{errors.teamName}</p>}
                </div>

                <div>
                  <Label htmlFor="password">Password *</Label>
                  <PasswordInput
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    error={errors.password}
                  />
                  <PasswordStrength password={password} />
                  {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <PasswordInput
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    error={errors.confirmPassword}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Section B – Members */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Team Members</h3>

                {members.map((m, idx) => (
                  <div key={idx} className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border relative">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {idx === 0 ? "👑 Team Leader" : `Member ${idx + 1}`}
                        {idx < 2 ? " *" : " (optional)"}
                      </span>
                      {idx >= 2 && (
                        <button type="button" onClick={() => removeMember(idx)} className="text-muted-foreground hover:text-destructive">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Input
                          placeholder="Full Name"
                          value={m.name}
                          onChange={(e) => updateMember(idx, "name", e.target.value)}
                          className={fieldClass(`m${idx}_name`)}
                          aria-label={`Member ${idx + 1} name`}
                        />
                        {errors[`m${idx}_name`] && <p className="text-xs text-destructive mt-1">{errors[`m${idx}_name`]}</p>}
                      </div>
                      <div>
                        <Input
                          type="email"
                          placeholder="Email"
                          value={m.email}
                          onChange={(e) => updateMember(idx, "email", e.target.value)}
                          className={fieldClass(`m${idx}_email`)}
                          aria-label={`Member ${idx + 1} email`}
                        />
                        {errors[`m${idx}_email`] && <p className="text-xs text-destructive mt-1">{errors[`m${idx}_email`]}</p>}
                      </div>
                      {idx === 0 && (
                        <>
                          <div>
                            <Input
                              placeholder="Phone"
                              value={m.phone || ""}
                              onChange={(e) => updateMember(idx, "phone", e.target.value)}
                              className={fieldClass("m0_phone")}
                              aria-label="Leader phone"
                            />
                            {errors.m0_phone && <p className="text-xs text-destructive mt-1">{errors.m0_phone}</p>}
                          </div>
                          <div>
                            <Input
                              placeholder="Department"
                              value={m.department || ""}
                              onChange={(e) => updateMember(idx, "department", e.target.value)}
                              className={fieldClass("m0_dept")}
                              aria-label="Leader department"
                            />
                            {errors.m0_dept && <p className="text-xs text-destructive mt-1">{errors.m0_dept}</p>}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {members.length < 3 && (
                  <Button type="button" variant="outline" size="sm" onClick={addMember} className="w-full border-dashed">
                    <UserPlus className="h-4 w-4 mr-2" /> Add Member
                  </Button>
                )}
              </div>

              {/* Section C – Agreement */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="agree"
                    checked={agreed}
                    onCheckedChange={(v) => setAgreed(v === true)}
                  />
                  <Label htmlFor="agree" className="text-sm leading-snug cursor-pointer">
                    I agree to follow the{" "}
                    <button type="button" onClick={() => setRulesOpen(true)} className="text-primary underline">
                      event rules
                    </button>
                  </Label>
                </div>
                {errors.agreed && <p className="text-xs text-destructive">{errors.agreed}</p>}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 font-display tracking-wider neon-glow-strong text-base"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Register Team"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already registered?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Login
                </Link>
              </p>
            </form>
          )}

          {/* Rules Modal */}
          <Dialog open={rulesOpen} onOpenChange={setRulesOpen}>
            <DialogContent className="glass border-border">
              <DialogHeader>
                <DialogTitle className="font-display">Event Rules</DialogTitle>
                <DialogDescription>Please read carefully before registering.</DialogDescription>
              </DialogHeader>
              <ul className="space-y-3 text-sm text-muted-foreground list-disc pl-4">
                <li>Each team must have 2–3 members.</li>
                <li>All rounds must be completed in order.</li>
                <li>Rankings are based on response time.</li>
                <li>Any form of cheating leads to disqualification.</li>
                <li>Internet will be provided at the venue.</li>
                <li>Devices must be laptops only — no mobile devices.</li>
              </ul>
            </DialogContent>
          </Dialog>
        </div>
      }
    />
  );
};

export default Register;
