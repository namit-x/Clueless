import ScrollReveal from "./ScrollReveal";

const events = [
  { title: "Registration Opens", date: "Feb 25", icon: "📝" },
  { title: "Event Day", date: "Mar 15", icon: "🚀" },
  { title: "Final Round", date: "Mar 15", icon: "⚡" },
  { title: "Winner Announcement", date: "Mar 15", icon: "🏆" },
];

const Timeline = () => (
  <section className="section-padding relative">
    <div className="absolute inset-0 gradient-bg opacity-30" />
    <div className="section-container relative z-10">
      <ScrollReveal>
        <h2 className="section-title text-primary neon-text">Event Timeline</h2>
        <p className="text-center text-muted-foreground mb-16">Key milestones on your path to victory.</p>
      </ScrollReveal>

      {/* Desktop horizontal */}
      <div className="hidden md:block">
        <div className="relative">
          <div className="absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="grid grid-cols-4 gap-6">
            {events.map((e, i) => (
              <ScrollReveal key={e.title} delay={i * 150}>
                <div className="text-center relative">
                  <div className="w-16 h-16 mx-auto glass rounded-2xl flex items-center justify-center text-2xl mb-4 border border-primary/20">
                    {e.icon}
                  </div>
                  <h3 className="font-display text-sm font-bold mb-1 tracking-wide">{e.title}</h3>
                  <p className="text-muted-foreground text-sm">{e.date}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile vertical */}
      <div className="md:hidden space-y-6">
        {events.map((e, i) => (
          <ScrollReveal key={e.title} delay={i * 100}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 glass rounded-xl flex items-center justify-center text-xl shrink-0 border border-primary/20">
                {e.icon}
              </div>
              <div>
                <h3 className="font-display text-sm font-bold tracking-wide">{e.title}</h3>
                <p className="text-muted-foreground text-sm">{e.date}</p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);

export default Timeline;
