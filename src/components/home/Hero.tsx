import { hero } from "../../data/home";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center overflow-hidden">
      <div className="container px-4 z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 py-8 md:py-12">
        <div className="flex-1 space-y-6 md:space-y-8 max-w-xl">
          <div className="text-center md:text-left space-y-4 md:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent leading-tight">
              {hero.title}
              <br />
              <span className="text-primary font-mono">{hero.accent}</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">{hero.subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center md:justify-start">
              <a href={hero.primaryCta.href}>
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 md:px-8 text-base md:text-lg h-11 md:h-12 w-full sm:w-auto">
                  {hero.primaryCta.label}
                </button>
              </a>
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all border shadow-xs hover:bg-accent hover:text-accent-foreground rounded-full px-6 md:px-8 text-base md:text-lg h-11 md:h-12 backdrop-blur-sm bg-background/30 w-full sm:w-auto">
                {hero.secondaryCta.label}
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 w-full h-[300px] md:h-[400px] lg:h-[600px] flex items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
}
