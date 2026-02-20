'use client'
import ScrollReveal from "@/components/ScrollReveal";

const steps = [
  { num: "01", title: "Compete in 4 Rounds", desc: "Face unique challenges testing logic, code, and creativity." },
  { num: "02", title: "Unlock One Word", desc: "Each round reveals a secret word upon completion." },
  { num: "03", title: "Reveal the Key", desc: "Combine all four words to form the final secret sentence." },
];

const words = ["WORD 1", "WORD 2", "WORD 3", "WORD 4"];

const HowItWorks = () => (
  <section id="how-it-works" className="section-padding relative">
    <div className="absolute inset-0 gradient-bg opacity-50" />
    <div className="section-container relative z-10">
      <ScrollReveal>
        <h2 className="section-title text-primary neon-text">How It Works</h2>
        <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto">
          A four-stage journey where speed and intelligence unlock the final key.
        </p>
      </ScrollReveal>

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {steps.map((step, i) => (
          <ScrollReveal key={step.num} delay={i * 150}>
            <div className="glass rounded-2xl p-8 text-center hover:neon-glow transition-all duration-300 group cursor-default h-full">
              <div className="font-display text-4xl font-black text-primary/30 group-hover:text-primary transition-colors mb-4">
                {step.num}
              </div>
              <h3 className="font-display text-lg font-bold mb-3 tracking-wide">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.desc}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {words.map((w, i) => (
            <div key={i} className="flex items-center gap-3 sm:gap-4">
              <div className="glass rounded-xl px-4 sm:px-6 py-3 font-display text-sm sm:text-base font-bold text-primary animate-glow-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                🔓 {w}
              </div>
              {i < words.length - 1 && <span className="text-muted-foreground text-xl hidden sm:block">+</span>}
            </div>
          ))}
          <span className="text-muted-foreground text-xl mx-2">=</span>
          <div className="glass rounded-xl px-6 py-3 font-display text-sm sm:text-base font-bold text-secondary neon-text-purple neon-glow-purple">
            🔑 FINAL KEY
          </div>
        </div>
      </ScrollReveal>
    </div>
  </section>
);

export default HowItWorks;
