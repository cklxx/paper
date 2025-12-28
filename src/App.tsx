import { useCallback, useMemo, useRef, useState } from "react";
import type { TouchEvent } from "react";
import { CardView } from "./components/CardView";
import { ProgressDots } from "./components/ProgressDots";
import { samplePapers } from "./data/papers";
import {
  ACTIVE_USER_ID,
  collaborativeFeedback,
  rankPapersForUser,
} from "./data/recommendations";

const CARDS_PER_PAPER = 5;
const SWIPE_THRESHOLD = 50;
type SwipeStart = { x: number; y: number };
const rankedPapers = rankPapersForUser(
  samplePapers,
  collaborativeFeedback,
  ACTIVE_USER_ID,
);

function useSwipeState(totalPapers: number) {
  const [paperIndex, setPaperIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const swipeStart = useRef<SwipeStart | null>(null);

  const nextCard = useCallback(() => {
    setCardIndex((current) => {
      const next = current + 1;
      return Math.min(next, CARDS_PER_PAPER - 1);
    });
  }, []);

  const prevCard = useCallback(() => {
    setCardIndex((current) => Math.max(current - 1, 0));
  }, []);

  const nextPaper = useCallback(() => {
    setPaperIndex((current) => (current + 1) % totalPapers);
    setCardIndex(0);
  }, [totalPapers]);

  const prevPaper = useCallback(() => {
    setPaperIndex((current) => (current - 1 + totalPapers) % totalPapers);
    setCardIndex(0);
  }, [totalPapers]);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    const firstTouch = event.touches[0];
    if (!firstTouch) return;
    swipeStart.current = { x: firstTouch.clientX, y: firstTouch.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      const start = swipeStart.current;
      const endTouch = event.changedTouches[0];
      swipeStart.current = null;

      if (!start || !endTouch) return;

      const deltaX = endTouch.clientX - start.x;
      const deltaY = endTouch.clientY - start.y;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX < SWIPE_THRESHOLD && absY < SWIPE_THRESHOLD) return;

      if (absY > absX) {
        if (deltaY <= -SWIPE_THRESHOLD) {
          nextPaper();
        } else {
          prevPaper();
        }
        return;
      }

      if (deltaX <= -SWIPE_THRESHOLD) {
        nextCard();
      } else {
        prevCard();
      }
    },
    [nextCard, nextPaper, prevCard, prevPaper]
  );

  return {
    paperIndex,
    cardIndex,
    nextCard,
    prevCard,
    nextPaper,
    prevPaper,
    handleTouchStart,
    handleTouchEnd,
  };
}

export default function App() {
  const {
    paperIndex,
    cardIndex,
    handleTouchEnd,
    handleTouchStart,
    nextCard,
    prevCard,
    nextPaper,
    prevPaper,
  } = useSwipeState(rankedPapers.length);
  const paper = rankedPapers[paperIndex];

  const card = useMemo(() => paper.cards[cardIndex], [cardIndex, paper]);

  return (
    <main className="app">
      <header className="paper-header">
        <div className="paper-meta">
          <p className="paper-topic">{paper.topic}</p>
          <h2 className="paper-title" aria-label="paper title">
            {paper.title}
          </h2>
          <a className="paper-source" href={paper.source.url} target="_blank" rel="noreferrer">
            {paper.source.title}
          </a>
        </div>
        <div className="paper-nav">
          <button type="button" className="nav-button" onClick={prevPaper} data-testid="prev-paper">
            上一篇
          </button>
          <button type="button" className="nav-button" onClick={nextPaper} data-testid="next-paper">
            下一篇
          </button>
        </div>
      </header>

      <div className="card-stack">
        <div className="card-frame" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <CardView card={card} />
          <ProgressDots total={paper.cards.length} activeIndex={cardIndex} />
        </div>

        <div className="control-row">
          <div className="control-group">
            <button
              type="button"
              className="nav-button subtle"
              onClick={prevCard}
              data-testid="prev-card"
              aria-label="上一张卡片"
            >
              上一张
            </button>
            <button
              type="button"
              className="nav-button"
              onClick={nextCard}
              data-testid="next-card"
              aria-label="下一张卡片"
            >
              下一张
            </button>
          </div>
          <p className="control-hint">左右滑切卡片，上下滑切论文</p>
        </div>
      </div>
    </main>
  );
}
