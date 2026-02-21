'use client'
import { useEffect, useState } from "react";
import CountDown from "@/components/CountDown";

const HeroSection = () => {

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-bg" />
      <div className="absolute inset-0 grid-pattern opacity-30" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-neon-cyan/5 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-neon-purple/5 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-wider mb-6 animate-fade-up">
          <span className="text-primary neon-text">AI × IoT</span>
          <br />
          <span className="text-foreground">CODE ARENA 2026</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          Four Rounds. Four Words. One Final Sentence. Fastest Mind Wins.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <a
            href="/register"
            className="px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm tracking-wider neon-glow-strong hover:scale-105 transition-transform duration-200"
          >
            REGISTER NOW
          </a>
          <a
            href="#rules"
            className="px-8 py-3.5 rounded-lg border border-primary/50 text-primary font-display font-bold text-sm tracking-wider hover:bg-primary/10 transition-all duration-200"
          >
            VIEW RULES
          </a>
        </div>

        {/* Countdown */}
        {/* <div className="flex justify-center gap-3 sm:gap-6 animate-fade-up" style={{ animationDelay: "0.6s" }}>
          {[
            { value: timeLeft.days, label: "Days" },
            { value: timeLeft.hours, label: "Hours" },
            { value: timeLeft.minutes, label: "Minutes" },
            { value: timeLeft.seconds, label: "Seconds" },
          ].map((item) => (
            <div key={item.label} className="glass rounded-xl px-4 sm:px-6 py-3 sm:py-4 min-w-17.5 sm:min-w-22.5">
              <div className="font-display text-2xl sm:text-3xl font-bold text-primary neon-text">
                {pad(item.value)}
              </div>
              <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{item.label}</div>
            </div>
          ))}
        </div> */}
        <CountDown />
      </div>
    </section>
  );
};

export default HeroSection;
