import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ScrollReveal from "./ScrollReveal";
import ReadingGhost from "./ReadingGhost";

const rules = [
  { q: "Team Size Rules", a: "Each team must consist of 4 members strictly." },
  { q: "Submission Rules", a: "Answers must be submitted within the given time frame. Late submissions will not be accepted. Each round has its own submission portal." },
  { q: "Ranking Criteria", a: "Teams are ranked based on accuracy and response time. In case of a tie, the faster submission wins." },
  { q: "Disqualification Policy", a: "Any form of cheating , or use of unauthorized tools will result in immediate blocking the team to play further." },
  // { q: "Internet & Device Rules", a: "Internet will be provided. Personal hotspots are not allowed. One device per team is permitted." },
];

const RulesSection = () => (
  <section id="rules" className="section-padding relative">
    <div className="section-container relative z-10 max-w-6xl">
      <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
        <div className="w-full lg:max-w-3xl">
          <ScrollReveal>
            <h2 className="section-title text-primary neon-text lg:text-left">Rules</h2>
            <p className="text-center text-muted-foreground mb-8 sm:mb-12 lg:text-left">
              Know the ground rules before you compete.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <Accordion type="single" collapsible className="space-y-3">
              {rules.map((r, i) => (
                <AccordionItem key={i} value={`rule-${i}`} className="glass rounded-xl border border-border/50 px-4 sm:px-6 overflow-hidden">
                  <AccordionTrigger className="font-display text-sm font-bold tracking-wide hover:text-primary transition-colors py-4 sm:py-5">
                    {r.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm pb-4 sm:pb-5">
                    {r.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollReveal>
        </div>

        <div className="flex justify-center items-center lg:min-h-[320px] lg:flex-1 lg:justify-end">
          <ReadingGhost className="lg:scale-[2.4] lg:origin-center" />
        </div>
      </div>
    </div>
  </section>
);

export default RulesSection;
