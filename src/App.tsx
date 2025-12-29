import { useCallback, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { CardView } from "./components/CardView";
import { ProgressDots } from "./components/ProgressDots";
import { samplePapers } from "./data/papers";
import {
  ACTIVE_USER_ID,
  collaborativeFeedback,
  rankPapersForUser,
} from "./data/recommendations";

const SWIPE_THRESHOLD = 50;
type SwipeStart = { x: number; y: number };
const rankedPapers = rankPapersForUser(
  samplePapers,
  collaborativeFeedback,
  ACTIVE_USER_ID,
);

function useSwipeState(totalPapers: number, getCardCount: (paperIndex: number) => number) {
  const [paperIndex, setPaperIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const activePointerId = useRef<number | null>(null);
  const swipeStart = useRef<SwipeStart | null>(null);

  const nextCard = useCallback(() => {
    setCardIndex((current) => {
      const next = current + 1;
      const limit = getCardCount(paperIndex) - 1;
      return Math.min(next, limit);
    });
  }, [getCardCount, paperIndex]);

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

  const resetSwipe = useCallback(() => {
    swipeStart.current = null;
    activePointerId.current = null;
  }, []);

  const handlePointerDown = useCallback((event: PointerEvent) => {
    activePointerId.current = event.pointerId;
    swipeStart.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const evaluateSwipe = useCallback(
    (deltaX: number, deltaY: number) => {
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
    [nextCard, nextPaper, prevCard, prevPaper],
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      if (activePointerId.current !== event.pointerId) return;
      const start = swipeStart.current;
      resetSwipe();

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      if (!start) return;

      const deltaX = event.clientX - start.x;
      const deltaY = event.clientY - start.y;

      evaluateSwipe(deltaX, deltaY);
    },
    [evaluateSwipe, resetSwipe],
  );

  const handlePointerCancel = useCallback(
    (event: PointerEvent) => {
      if (activePointerId.current !== event.pointerId) return;
      resetSwipe();
    },
    [resetSwipe],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (activePointerId.current !== event.pointerId) return;
      if (swipeStart.current) {
        event.preventDefault();
      }
    },
    [],
  );

  return {
    paperIndex,
    cardIndex,
    nextCard,
    prevCard,
    nextPaper,
    prevPaper,
    handlePointerDown,
    handlePointerUp,
    handlePointerMove,
    handlePointerCancel,
  };
}

export default function App() {
  const getCardCount = useCallback(
    (index: number) => rankedPapers[index].cards.length,
    [],
  );
  const {
    paperIndex,
    cardIndex,
    handlePointerUp,
    handlePointerDown,
    handlePointerMove,
    handlePointerCancel,
  } = useSwipeState(rankedPapers.length, getCardCount);
  const paper = rankedPapers[paperIndex];

  const card = useMemo(() => paper.cards[cardIndex], [cardIndex, paper]);

  return (
    <main className="app">
      <div className="card-stack">
        <div
          className="card-frame"
          data-testid="card-frame"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerMove={handlePointerMove}
          onPointerCancel={handlePointerCancel}
        >
          <div className="card-topbar">
            <div className="paper-meta">
              <p className="paper-topic">{paper.topic}</p>
              <h2 className="paper-title" aria-label="paper title">
                {paper.title}
              </h2>
              <a className="paper-source" href={paper.source.url} target="_blank" rel="noreferrer">
                {paper.source.title}
              </a>
            </div>
          </div>

          <CardView card={card} />

          <div className="card-controls">
            <ProgressDots total={paper.cards.length} activeIndex={cardIndex} />
            <p className="control-hint">左右滑切卡片，上下滑切论文</p>
          </div>
        </div>
      </div>
    </main>
  );
}
