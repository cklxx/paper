import { features } from "../../data/home";

export default function FeatureGrid() {
  return (
    <div className="absolute z-20 w-full max-w-5xl px-4 grid grid-cols-1 md:grid-cols-3 gap-6 pointer-events-none">
      {features.map((feature) => (
        <div key={feature.title} className="glass p-6 rounded-xl relative overflow-hidden border transition-colors duration-300">
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <span className="font-mono text-sm text-muted-foreground">{feature.title}</span>
          </div>
          <div className="relative z-10">
            <div className="bg-black/40 p-3 rounded-lg border border-white/5 font-mono text-xs text-muted-foreground overflow-hidden">
              {feature.code}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
