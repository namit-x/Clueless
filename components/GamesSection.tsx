import ScrollReveal from "./ScrollReveal";

const games = [
  { icon: "🗺️", title: "Treasure Hunt", desc: "Clues. Logic. Precision." },
  { icon: "🔢", title: "Digit Manipulation", desc: "Numbers aren't what they seem." },
  { icon: "💻", title: "Jumbled ASCII", desc: "Decode the digital chaos." },
  { icon: "🔮", title: "Blind Code", desc: "See without seeing." },
];

const GamesSection = () => (
  <section id="games" className="section-padding relative">
    <div className="section-container relative z-10">
      <ScrollReveal>
        <h2 className="section-title text-primary neon-text">The Four Challenges</h2>
        <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto">
          Each challenge pushes your limits in a different way.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {games.map((game, i) => (
          <ScrollReveal key={game.title} delay={i * 100}>
            <div className="glass rounded-2xl p-8 text-center hover:scale-105 hover:neon-glow transition-all duration-300 cursor-default h-full border border-primary/10 hover:border-primary/30">
              <div className="text-5xl mb-6">{game.icon}</div>
              <h3 className="font-display text-lg font-bold mb-3 tracking-wide">{game.title}</h3>
              <p className="text-muted-foreground text-sm">{game.desc}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);

export default GamesSection;
