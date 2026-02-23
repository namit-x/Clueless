'use client'

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";

const Login = () => {
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [loginError, setLoginError] = useState("");

  const validate = () => {
    const e: Record<string, string> = {};
    if (!teamName.trim()) e.teamName = "Team name is required";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

const handleSubmit = async (ev: FormEvent<HTMLFormElement>) => {
  ev.preventDefault();

  const form = ev.currentTarget;
  const formData = new FormData(form);

  console.log("Form Data:", teamName, password);
  // for (const [key, value] of formData.entries()) {
  //   console.log(`${key}:`, value);
  // }


  setLoginError("");
  if (!validate()) return;

  setLoading(true);
  await new Promise((r) => setTimeout(r, 1500));
  setLoading(false);
};

    return (    
   <div className="min-h-screen bg-background gradient-bg grid-pattern flex flex-col items-center justify-center p-6 sm:p-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 text-xl hover:scale-110 transition-transform"
      >
        <FontAwesomeIcon className="absolute top-6 left-6 p-3 rounded-full bg-muted hover:bg-primary hover:text-white transition-all shadow-md" icon={faAngleLeft} />
      </button>

      {/* Branding - above the form */}
      <div className="text-center space-y-4 animate-fade-up mb-8 max-w-md">
        <p className="section-title font-display neon-text">Welcome Back</p>
        <p className="text-muted-foreground">
          Access your team dashboard and compete live.
        </p>
      </div>
      
      {/* Login Card - centered */}
      <div
        className={cn(
          "glass rounded-2xl p-6 sm:p-8 neon-glow animate-fade-up transition-transform w-full max-w-lg",
          shake && "animate-[shake_0.5s_ease-in-out]"
        )}
        style={{ animationDelay: "0.15s" }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="font-display text-xl font-bold tracking-wide text-center">Team Login</h2>
          {loginError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive text-center">
              {loginError}
            </div>
          )}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="loginTeam">Team Name</Label>
              <Input
                id="loginTeam"
                autoFocus
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className={`bg-muted/50 border-border focus:border-primary transition-colors ${errors.teamName ? "border-destructive" : ""}`}
                placeholder="Enter your team name"
              />
              {errors.teamName && <p className="text-xs text-destructive mt-1">{errors.teamName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="loginPass">Password</Label>
              <PasswordInput
                id="loginPass"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                error={errors.password}
              />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>
          </div>
 <button type="button" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Forgot Password?
          </button>
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 font-display tracking-wider neon-glow-strong text-base"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Login"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
    )


};

export default Login;

