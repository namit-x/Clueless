'use client'
import { useEffect, useState } from "react";

const targetDate = new Date("2026-03-15T10:00:00");

const CountDown = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const diff = Math.max(0, targetDate.getTime() - now.getTime());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div
      className="flex flex-wrap justify-center gap-2 sm:gap-6 animate-fade-up"
      style={{ animationDelay: "0.6s" }}
    >
      {[
        { value: timeLeft.days, label: "Days" },
        { value: timeLeft.hours, label: "Hours" },
        { value: timeLeft.minutes, label: "Minutes" },
        { value: timeLeft.seconds, label: "Seconds" },
      ].map((item) => (
        <div
          key={item.label}
          className="glass rounded-xl px-3 sm:px-6 py-2.5 sm:py-4 min-w-[70px] sm:min-w-[90px]"
        >
          <div className="font-display text-xl sm:text-3xl font-bold text-primary neon-text">
            {pad(item.value)}
          </div>
          <div className="text-[10px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-wider">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CountDown;