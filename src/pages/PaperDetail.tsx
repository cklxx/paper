import { Link, useParams } from "react-router-dom";
import { findPaperById } from "../data/papers";
import {
  difficultyStyles,
  getProblemsForPaperId,
  problemTypeStyles,
} from "../data/problems";
import { useProgress } from "../hooks/useProgress";

const formatIndex = (index: number) => String(index + 1).padStart(2, "0");

export default function PaperDetail() {
  const { paperId } = useParams();
  const paper = paperId ? findPaperById(paperId) : undefined;
  const problems = paperId ? getProblemsForPaperId(paperId) : [];
  const { isComplete } = useProgress();

  if (!paper) {
    return (
      <div className="container mx-auto px-4 py-10">
        <p className="text-muted-foreground">论文不存在。</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 min-h-screen">
      <div className="flex items-center gap-3">
        <Link
          to="/papers"
          className="text-sm text-muted-foreground hover:text-foreground transition"
        >
          ← 返回论文列表
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{paper.title}</h1>
          {paper.year ? (
            <span className="text-xs px-2 py-1 rounded-full border border-white/10 text-muted-foreground">
              {paper.year}
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {paper.authors.map((author) => (
            <span
              key={author}
              className="text-xs px-2 py-1 rounded-full border border-white/10 text-muted-foreground"
            >
              {author}
            </span>
          ))}
        </div>
        <p className="text-sm text-muted-foreground max-w-3xl">{paper.summary}</p>
        <a
          href={paper.source.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-white/10 hover:bg-white/5 w-fit"
        >
          阅读原文
        </a>
      </div>

      <div className="mt-10 flex items-center gap-3">
        <h2 className="text-lg font-semibold">实现路径</h2>
        <span className="text-xs px-2 py-1 rounded-full border border-white/10 text-muted-foreground">
          {problems.length} 个任务
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4">
        {problems.map((problem, index) => {
          const completed = isComplete(problem.paperId, problem.id);
          return (
            <Link
              key={problem.id}
              to={`/papers/${problem.paperId}/problems/${problem.id}`}
              className={`glass p-5 rounded-xl border border-white/10 transition hover:border-white/20 flex items-start gap-4 ${
                completed ? "bg-muted/10 border-emerald-500/30" : ""
              }`}
            >
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Task {formatIndex(index)}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold">{problem.title}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${problemTypeStyles[problem.type]}`}
                  >
                    {problem.type}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${difficultyStyles[problem.difficulty]}`}
                  >
                    {problem.difficulty}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{problem.description}</p>
              </div>
              <div className="ml-auto">
                {completed ? (
                  <span className="text-emerald-400">●</span>
                ) : (
                  <span className="text-muted-foreground">○</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
