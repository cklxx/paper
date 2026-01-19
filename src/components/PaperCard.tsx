import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Paper } from "../data/papers";
import { paperTagStyles } from "../data/papers";

const badgeBase =
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden";

type PaperCardProps = {
  paper: Paper;
  progress?: number;
  showProgress?: boolean;
};

function formatAuthors(authors: string[]) {
  if (authors.length > 2) {
    return `${authors.slice(0, 2).join("、")} 等`;
  }
  return authors.join("、");
}

export default function PaperCard({ paper, progress = 0, showProgress = false }: PaperCardProps) {
  return (
    <Link className="group block h-full" to={`/papers/${paper.id}`}>
      <motion.div className="h-full" whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
        <div className="h-full relative overflow-hidden rounded-xl border border-white/10 bg-background/40 backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_-5px_rgba(var(--primary),0.2)]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
          <div className="flex flex-col h-full p-6 relative z-10">
            <div className="flex justify-between items-start gap-2 mb-4">
              <div className="flex flex-wrap gap-2">
                <span className={`${badgeBase} font-mono text-xs border-transparent bg-secondary/50 backdrop-blur-sm`}>
                  {paper.year}
                </span>
                {paper.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`${badgeBase} font-mono text-xs border-0 backdrop-blur-sm ${
                      paperTagStyles[tag] ?? "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <svg
                aria-hidden="true"
                className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
              >
                <path d="M15 12h-5" />
                <path d="M15 8h-5" />
                <path d="M19 17V5a2 2 0 0 0-2-2H4" />
                <path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3" />
              </svg>
            </div>
            <h3 className="text-xl font-bold group-hover:text-primary transition-colors leading-tight mb-2">
              {paper.title}
            </h3>
            <p className="font-mono text-xs text-muted-foreground mb-4">{formatAuthors(paper.authors)}</p>
            <div className="flex-1 flex flex-col justify-end gap-4">
              <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">{paper.description}</p>
              {showProgress && progress > 0 ? (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>进度</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1 bg-muted/50 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/80" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
