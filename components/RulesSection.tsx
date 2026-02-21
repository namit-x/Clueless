import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ScrollReveal from "./ScrollReveal";

const rules = [
  { q: "Team Size Rules", a: "Each team must consist of 2–4 members. Solo participation is not allowed. All members must be from the same college." },
  { q: "Submission Rules", a: "Answers must be submitted within the given time frame. Late submissions will not be accepted. Each round has its own submission portal." },
  { q: "Ranking Criteria", a: "Teams are ranked based on accuracy and response time. In case of a tie, the faster submission wins." },
  { q: "Disqualification Policy", a: "Any form of cheating, plagiarism, or use of unauthorized tools will result in immediate disqualification." },
  { q: "Internet & Device Rules", a: "Internet will be provided. Personal hotspots are not allowed. One device per team is permitted." },
];

const RulesSection = () => (
  <section id="rules" className="section-padding relative">
    <div className="section-container relative z-10 max-w-2xl">
      <ScrollReveal>
        <h2 className="section-title text-primary neon-text">Rules</h2>
        <p className="text-center text-muted-foreground mb-12">Know the ground rules before you compete.</p>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <Accordion type="single" collapsible className="space-y-3">
          {rules.map((r, i) => (
            <AccordionItem key={i} value={`rule-${i}`} className="glass rounded-xl border border-border/50 px-6 overflow-hidden">
              <AccordionTrigger className="font-display text-sm font-bold tracking-wide hover:text-primary transition-colors py-5">
                {r.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm pb-5">
                {r.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollReveal>
    </div>
  </section>
);

export default RulesSection;
