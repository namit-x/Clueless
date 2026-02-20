import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ScrollReveal from "./ScrollReveal";

const faqs = [
  { q: "Is coding required?", a: "Basic coding knowledge is helpful but not strictly required. The challenges test a mix of logic, pattern recognition, and coding skills." },
  { q: "Can we use mobile devices?", a: "No. Only laptops or desktops are allowed during the event. One device per team." },
  { q: "What happens if we refresh the page?", a: "Your progress is auto-saved. Refreshing the page will not affect your submissions or timer." },
  { q: "How is ranking calculated?", a: "Ranking is based on accuracy first, then response time. The fastest correct answer wins in case of a tie." },
  { q: "Is internet provided?", a: "Yes, internet will be provided at the venue. Personal hotspots are strictly prohibited." },
];

const FAQSection = () => (
  <section id="faq" className="section-padding relative">
    <div className="absolute inset-0 gradient-bg opacity-30" />
    <div className="section-container relative z-10 max-w-2xl">
      <ScrollReveal>
        <h2 className="section-title text-primary neon-text">FAQ</h2>
        <p className="text-center text-muted-foreground mb-12">Got questions? We've got answers.</p>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="glass rounded-xl border border-border/50 px-6 overflow-hidden">
              <AccordionTrigger className="font-display text-sm font-bold tracking-wide hover:text-primary transition-colors py-5">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm pb-5">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollReveal>
    </div>
  </section>
);

export default FAQSection;
