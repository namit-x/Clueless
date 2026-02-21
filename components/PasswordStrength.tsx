import { cn } from "@/lib/utils";

const getStrength = (password: string): number => {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
};

const labels = ["", "Weak", "Fair", "Good", "Strong"];
const colors = ["", "bg-destructive", "bg-orange-500", "bg-yellow-500", "bg-green-500"];

const PasswordStrength = ({ password }: { password: string }) => {
  if (!password) return null;
  const strength = getStrength(password);

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              i <= strength ? colors[strength] : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{labels[strength]}</p>
    </div>
  );
};

export default PasswordStrength;
