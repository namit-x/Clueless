import ScrollReveal from "./ScrollReveal";

const teams = [
  { rank: "🥇", pos: 1, name: "CodeStorm", time: "02:14" },
  { rank: "🥈", pos: 2, name: "ByteForce", time: "02:19" },
  { rank: "🥉", pos: 3, name: "NeuralNet", time: "02:26" },
];

const Leaderboard = () => (
  <section className="section-padding relative">
    <div className="absolute inset-0 gradient-bg opacity-40" />
    <div className="section-container relative z-10 max-w-2xl">
      <ScrollReveal>
        <h2 className="section-title text-primary neon-text">Live Leaderboard</h2>
        <p className="text-center text-muted-foreground mb-12">Track the race in real time.</p>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-muted-foreground font-display">Rank</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-muted-foreground font-display">Team</th>
                <th className="text-right px-6 py-4 text-xs uppercase tracking-wider text-muted-foreground font-display">Time</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => (
                <tr
                  key={t.pos}
                  className={`border-b border-border/50 hover:bg-primary/5 transition-colors ${t.pos === 1 ? "bg-primary/5" : ""}`}
                >
                  <td className="px-6 py-4 font-display font-bold">
                    <span className="mr-2">{t.rank}</span>{t.pos}
                  </td>
                  <td className="px-6 py-4 font-semibold">{t.name}</td>
                  <td className="px-6 py-4 text-right font-display text-primary">{t.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-center text-muted-foreground text-sm mt-6">
          Rankings update live after every round based on response time.
        </p>
      </ScrollReveal>
    </div>
  </section>
);

export default Leaderboard;
