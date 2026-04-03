import ScrollReveal from "./ScrollReveal";

const events = [
  { title: "Registration Opens", date: "April 04", icon: "📝", year: 2026, month: 3, day: 1 },
  { title: "Registration Closes", date: "April 07", icon: "🔒", year: 2026, month: 3, day: 5 },
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
          <p className="text-center text-muted-foreground mb-8 sm:mb-16">Key milestones on your path to victory.</p>
        </ScrollReveal>

        <div className="relative mx-auto max-w-sm sm:max-w-2xl">
          <div className="hidden sm:block absolute sm:left-8 sm:top-8 sm:bottom-8 w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
          <div className="space-y-4 sm:space-y-8 md:space-y-10">
            {events.map((e, i) => {
              const isActive = i === activeIndex;
              const isPast = i < activeIndex;

              return (
                <ScrollReveal key={e.title} delay={i * 120}>
                  <div className={`relative flex items-start justify-center sm:justify-start gap-3 sm:gap-6 transition-opacity duration-300 ${isPast ? "opacity-45" : "opacity-100"}`}>
                    <div
                      className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border glass text-base ring-4 ring-background/90 sm:h-16 sm:w-16 sm:rounded-2xl sm:text-2xl transition-all duration-300 ${
                        isActive
                          ? "border-primary/20 ring-2 ring-primary scale-105"
                          : "border-primary/20"
                      }`}
                    >
                      {e.icon}
                    </div>
                    <div
                      className={`flex-1 max-w-[180px] sm:max-w-none glass rounded-xl border px-3 py-2.5 sm:px-6 sm:py-5 sm:rounded-2xl transition-all duration-300 hover:scale-[1.03] cursor-default ${
                        isActive
                          ? "border-primary/30 ring-2 ring-primary"
                          : "border-primary/15"
                      }`}
                    >
                      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-1">
                        {e.date}
                      </p>
                      <h3 className="font-display text-xs font-bold tracking-wide sm:text-base">{e.title}</h3>
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
