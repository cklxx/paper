import type { Paper } from "../data/papers";

export default function PaperCard({ paper }: { paper: Paper }) {
  return (
    <div className="glass p-6 rounded-xl border border-white/10 hover-lift">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{paper.title}</h3>
        <span className="text-xs text-muted-foreground">{paper.difficulty}</span>
      </div>
      <p className="text-sm text-muted-foreground">{paper.summary}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {paper.tags.map((tag) => (
          <span key={tag} className="text-xs text-muted-foreground border border-white/10 rounded-full px-2 py-1">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
