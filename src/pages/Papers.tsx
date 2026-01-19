import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import PaperCard from "../components/PaperCard";
import { paperFilterStyles, papers } from "../data/papers";
import { useLocalStorageState } from "../hooks/useLocalStorageState";
import { useProgress } from "../hooks/useProgress";

const badgeBase =
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden";

export default function Papers() {
  const [query, setQuery] = useLocalStorageState("pc.search", "");
  const [activeTags, setActiveTags] = useLocalStorageState<string[]>("pc.filters", []);
  const { getCounts } = useProgress();

  const tags = useMemo(() => {
    const tagSet = new Set<string>();
    papers.forEach((paper) => {
      paper.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return papers.filter((paper) => {
      const matchesQuery = normalized
        ? paper.title.toLowerCase().includes(normalized) ||
          paper.summary.toLowerCase().includes(normalized) ||
          paper.tags.some((tag) => tag.toLowerCase().includes(normalized))
        : true;
      const matchesTags = activeTags.length ? paper.tags.some((tag) => activeTags.includes(tag)) : true;
      return matchesQuery && matchesTags;
    });
  }, [query, activeTags]);

  const toggleTag = (tag: string) => {
    setActiveTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  };

  const clearAll = () => {
    setQuery("");
    setActiveTags([]);
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 min-h-screen">
      <div className="flex flex-col gap-4 md:gap-6 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">论文</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">选一篇，开始复现。</p>
        </div>
        <div className="relative w-full">
          <svg
            aria-hidden="true"
            className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
          >
            <path d="m21 21-4.34-4.34" />
            <circle cx="11" cy="11" r="8" />
          </svg>
          <input
            data-slot="input"
            className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive pl-10 h-10 bg-muted/30 border-white/10 focus-visible:ring-primary/50"
            placeholder="搜索论文或标签..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">筛选：</span>
          {tags.map((tag) => {
            const isActive = activeTags.includes(tag);
            return (
              <button
                key={tag}
                className={`${badgeBase} cursor-pointer transition-all text-xs py-1 px-3 border ${
                  isActive
                    ? `ring-1 ring-offset-1 ring-offset-background font-bold ${
                        paperFilterStyles[tag] ?? "bg-primary/10 text-primary border-primary/20"
                      }`
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-transparent bg-secondary/20"
                }`}
                onClick={() => toggleTag(tag)}
                type="button"
              >
                {tag}
                {isActive ? (
                  <svg
                    aria-hidden="true"
                    className="ml-1 h-3 w-3"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                ) : null}
              </button>
            );
          })}
          {activeTags.length > 0 ? (
            <button
              className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground ml-2 rounded-md transition-colors"
              onClick={() => setActiveTags([])}
              type="button"
            >
              清空筛选
            </button>
          ) : null}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((paper) => (
            <motion.div
              key={paper.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <PaperCard paper={paper} progress={getCounts(paper.id)} />
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && papers.length > 0 ? (
          <motion.div
            className="col-span-full text-center py-12 md:py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <svg
                aria-hidden="true"
                className="h-10 w-10 mb-4 opacity-20"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
              >
                <path d="m21 21-4.34-4.34" />
                <circle cx="11" cy="11" r="8" />
              </svg>
              <p className="text-base md:text-lg font-medium">没有找到</p>
              <p className="text-sm">换个关键词或标签。</p>
              <button className="mt-2 text-sm text-primary hover:underline" onClick={clearAll} type="button">
                清空条件
              </button>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
