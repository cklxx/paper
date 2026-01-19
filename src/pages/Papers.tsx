import { useMemo } from "react";
import PaperCard from "../components/PaperCard";
import { allTags, papers } from "../data/papers";
import { useLocalStorageState } from "../hooks/useLocalStorageState";

export default function Papers() {
  const [query, setQuery] = useLocalStorageState("pc.search", "");
  const [activeTags, setActiveTags] = useLocalStorageState<string[]>("pc.filters", []);

  const filtered = useMemo(() => {
    return papers.filter((paper) => {
      const matchesQuery = query
        ? paper.title.includes(query) || paper.summary.includes(query) || paper.tags.some((tag) => tag.includes(query))
        : true;
      const matchesTags = activeTags.length
        ? activeTags.every((tag) => paper.tags.includes(tag))
        : true;
      return matchesQuery && matchesTags;
    });
  }, [query, activeTags]);

  const toggleTag = (tag: string) => {
    setActiveTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 min-h-screen">
      <div className="flex flex-col gap-4 md:gap-6 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">论文</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">挑一篇，边写边学。</p>
        </div>
        <div className="relative w-full">
          <input
            className="w-full rounded-md border px-3 py-1 text-base shadow-xs outline-none pl-10 h-10 bg-muted/30 border-white/10"
            placeholder="搜索论文、标签..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">筛选：</span>
          {allTags.map((tag) => (
            <button
              key={tag}
              className={`text-xs rounded-full px-3 py-1 border ${
                activeTags.includes(tag)
                  ? "bg-primary text-primary-foreground"
                  : "border-white/10 text-muted-foreground"
              }`}
              onClick={() => toggleTag(tag)}
              type="button"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filtered.map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
      </div>
    </div>
  );
}
