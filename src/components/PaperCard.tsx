import { Link } from "react-router-dom";
import type { Paper } from "../data/papers";

type Progress = {
  completed: number;
  total: number;
};

export default function PaperCard({ paper, progress }: { paper: Paper; progress?: Progress }) {
  const percent = progress && progress.total ? (progress.completed / progress.total) * 100 : 0;

  return (
    <Link to={`/papers/${paper.id}`} className="glass p-6 rounded-xl border border-white/10 hover-lift block">
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
      {progress ? (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>进度</span>
            <span>
              {progress.completed}/{progress.total}
            </span>
          </div>
          <div className="mt-2 h-1 rounded-full bg-white/10">
            <div className="h-1 rounded-full bg-emerald-400" style={{ width: `${percent}%` }} />
          </div>
        </div>
      ) : null}
    </Link>
  );
}
