import { systemOnline } from "../../data/home";

export default function SystemOnline() {
  return (
    <div className="absolute flex flex-col items-center" style={{ pointerEvents: "none" }}>
      <div className="mt-8 text-center">
        <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          {systemOnline.title}
        </h3>
        <p className="text-muted-foreground mt-2 max-w-xs mx-auto mb-6">{systemOnline.subtitle}</p>
        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-full px-8 shadow-lg shadow-purple-500/20">
          {systemOnline.cta}
        </button>
      </div>
    </div>
  );
}
