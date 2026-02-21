import ScrollReveal from "./ScrollReveal";

const CTASection = () => (
  <section id="register" className="section-padding relative">
    <div className="absolute inset-0 gradient-bg" />
    <div className="section-container relative z-10 text-center">
      <ScrollReveal>
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-wider mb-6">
          <span className="text-primary neon-text">Ready to Compete?</span>
        </h2>
        <p className="text-muted-foreground text-lg mb-10 max-w-md mx-auto">
          Limited team slots available. Register now before it's too late.
        </p>
        <a
          href="/register"
          className="inline-block px-10 py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg tracking-wider neon-glow-strong hover:scale-105 transition-transform duration-200"
        >
          REGISTER NOW
        </a>
      </ScrollReveal>
    </div>
  </section>
);

export default CTASection;
