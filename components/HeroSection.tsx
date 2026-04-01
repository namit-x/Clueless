'use client'
import CountDown from "@/components/CountDown";

const HeroSection = () => {

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-bg" />
      <div className="absolute inset-0 grid-pattern opacity-30" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-neon-cyan/5 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-neon-purple/5 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-wider mb-6 animate-fade-up">
          {/* <span className="block text-base sm:text-lg md:text-xl lg:text-2xl font-medium tracking-normal my-3">
            <span className="font-display font-extrabold text-2xl sm:text-4xl" style={{ color: "#8fff00" }}>Zigbee</span>
            <span className="text-muted-foreground"> and </span>
            <span className="font-display font-extrabold text-2xl sm:text-4xl" style={{ color: "#E9E4D4" }}>
              Neur
              <span style={{ color: "#8DF339" }}>O</span>
              n
            </span>
            <span className="text-muted-foreground"> Club </span>
            <br />
            <span className="font-bold text-2xl sm:text-4xl" style={{ fontFamily: '"Times New Roman", Times, serif' }}>Presents</span>
          </span> */}
          <br />
          {/* <span className="text-primary neon-text">AI × IoT</span> */}
          {/* <br /> */}
          <span className="text-5xl sm:text-7xl text-primary neon-text">
            ClueLess
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          Four Members.  Four Rounds. Fastest Mind Wins.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <a
            href="/register"
            className="px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm tracking-wider neon-glow-strong hover:scale-105 transition-transform duration-200"
          >
            REGISTER NOW
          </a>
          <a
            href="#rules"
            className="px-8 py-3.5 rounded-lg border border-primary/50 text-primary font-display font-bold text-sm tracking-wider hover:bg-primary/10 transition-all duration-200"
          >
            VIEW RULES
          </a>
        </div>
        <CountDown />
      </div>
    </section>
  );
};

export default HeroSection;
