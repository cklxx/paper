import { useMemo, useState } from "react";
import { CardView } from "./components/CardView";
import { ProgressDots } from "./components/ProgressDots";
import { samplePapers } from "./data/papers";

const CARDS_PER_PAPER = 5;

function useSwipeState() {
  const [paperIndex, setPaperIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);

  const nextCard = () => {
    setCardIndex((current) => {
      const next = current + 1;
      if (next < CARDS_PER_PAPER) {
        return next;
      }
      setPaperIndex((paper) => (paper + 1) % samplePapers.length);
      return 0;
    });
  };

  const prevCard = () => {
    setCardIndex((current) => Math.max(current - 1, 0));
  };

  const nextPaper = () => {
    setPaperIndex((current) => (current + 1) % samplePapers.length);
    setCardIndex(0);
  };

  return { paperIndex, cardIndex, nextCard, prevCard, nextPaper };
}

export default function App() {
  const { paperIndex, cardIndex, nextCard, prevCard, nextPaper } =
    useSwipeState();
  const paper = samplePapers[paperIndex];

  const card = useMemo(() => paper.cards[cardIndex], [cardIndex, paper.cards]);

  return (
    <main className="app">
      <header className="top-bar">
        <span className="topic-tag">{paper.topic}</span>
        <span className="title" aria-label="paper title">
          {paper.title}
        </span>
      </header>

      <div className="card-frame">
        <CardView card={card} />
      </div>

      <footer className="footer">
        <ProgressDots total={CARDS_PER_PAPER} activeIndex={cardIndex} />
        <div className="controls">
          <button onClick={prevCard} aria-label="previous card" data-testid="prev-card">
            ← 上一张
          </button>
          <button onClick={nextCard} aria-label="next card" data-testid="next-card">
            → 下一张
          </button>
          <button onClick={nextPaper} aria-label="next paper" data-testid="next-paper">
            ↑ 下一篇
          </button>
        </div>
        <p className="hint">
          手势映射：左滑=下一张 · 上滑=下一篇 · 下滑=回看
        </p>
      </footer>
    </main>
  );
}
