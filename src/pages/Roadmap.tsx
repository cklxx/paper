import { roadmap } from "../data/roadmap";
import { useLocalStorageState } from "../hooks/useLocalStorageState";

export default function Roadmap() {
  const [progress, setProgress] = useLocalStorageState<string[]>("pc.progress", []);

  const toggle = (item: string) => {
    setProgress((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item],
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">ML150 路线</h1>
      <div className="mt-6 space-y-6">
        {roadmap.map((section) => (
          <div key={section.title} className="glass p-6 rounded-xl border border-white/10">
            <h2 className="font-semibold mb-4">{section.title}</h2>
            <div className="flex flex-wrap gap-2">
              {section.items.map((item) => {
                const active = progress.includes(item);
                return (
                  <button
                    key={item}
                    className={`text-xs rounded-full px-3 py-1 border ${
                      active ? "bg-emerald-500/20 text-emerald-300" : "border-white/10 text-muted-foreground"
                    }`}
                    onClick={() => toggle(item)}
                    type="button"
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
