import ScrollReveal from "./ScrollReveal";

const events = [
  { title: "Registration Opens", date: "April 01", icon: "📝", year: 2026, month: 3, day: 1 },
  { title: "Registration Closes", date: "April 05", icon: "🔒", year: 2026, month: 3, day: 5 },
  { title: "Event Day", date: "April 09", icon: "⚡", year: 2026, month: 3, day: 9 },
];

function getActiveIndex(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let active = -1;
  events.forEach((e, i) => {
    const d = new Date(e.year, e.month, e.day);
    if (today >= d) active = i;
  });
  return active;
}

const Timeline = () => {
  const activeIndex = getActiveIndex();

  return (
    <section className="section-padding relative">
      <div className="absolute inset-0 gradient-bg opacity-30" />
      <div className="section-container relative z-10">
        <ScrollReveal>
          <h2 className="section-title text-primary neon-text">Event Timeline</h2>
          <p className="text-center text-muted-foreground mb-16">Key milestones on your path to victory.</p>
        </ScrollReveal>

        <div className="relative mx-auto max-w-2xl">
          <div className="absolute left-7 top-7 bottom-7 w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent sm:left-8 sm:top-8 sm:bottom-8" />
          <div className="space-y-8 sm:space-y-10">
            {events.map((e, i) => {
              const isActive = i === activeIndex;
              const isPast = i < activeIndex;

              return (
                <ScrollReveal key={e.title} delay={i * 120}>
                  <div className={`relative flex items-start gap-4 sm:gap-6 transition-opacity duration-300 ${isPast ? "opacity-45" : "opacity-100"}`}>
                    <div
                      className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border glass text-xl ring-4 ring-background/90 sm:h-16 sm:w-16 sm:rounded-2xl sm:text-2xl transition-all duration-300 ${
                        isActive
                          ? "border-primary shadow-[0_0_32px_rgba(6,182,212,0.55)] scale-110"
                          : "border-primary/20 shadow-[0_0_24px_rgba(6,182,212,0.12)]"
                      }`}
                    >
                      {e.icon}
                    </div>
                    <div
                      className={`flex-1 glass rounded-2xl border px-5 py-4 sm:px-6 sm:py-5 transition-all duration-300 ${
                        isActive
                          ? "border-primary shadow-[0_0_28px_rgba(6,182,212,0.3)] bg-primary/5"
                          : "border-primary/15"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                          {e.date}
                        </p>

                      </div>
                      <h3 className="font-display text-sm font-bold tracking-wide sm:text-base">{e.title}</h3>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Timeline;
