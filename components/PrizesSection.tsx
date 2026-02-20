import ScrollReveal from "./ScrollReveal";

const prizes = [
  { icon: "🥇", place: "First Prize", reward: "₹XXXX + Certificate", glow: true },
  { icon: "🥈", place: "Second Prize", reward: "₹XXXX", glow: false },
  { icon: "🥉", place: "Third Prize", reward: "₹XXXX", glow: false },
];

const PrizesSection = () => (
  <section id="prizes" className="section-padding relative">
    <div className="section-container relative z-10">
      <ScrollReveal>
        <h2 className="section-title text-primary neon-text">Rewards</h2>
        <p className="text-center text-muted-foreground mb-16">Glory, prizes, and bragging rights.</p>
      </ScrollReveal>

      <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        {prizes.map((p, i) => (
          <ScrollReveal key={p.place} delay={i * 150}>
            <div
              className={`glass rounded-2xl p-8 text-center transition-all duration-300 cursor-default h-full ${
                p.glow ? "neon-glow-strong border border-primary/30 scale-105" : "hover:neon-glow border border-border/50"
              }`}
            >
              <div className="text-5xl mb-4">{p.icon}</div>
              <h3 className="font-display text-lg font-bold mb-2 tracking-wide">{p.place}</h3>
              <p className="text-muted-foreground">{p.reward}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);

export default PrizesSection;
