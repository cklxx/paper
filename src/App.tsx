import { useCallback, useMemo, useRef, useState } from "react";
import type { TouchEvent } from "react";
import { CardView } from "./components/CardView";
import { ProgressDots } from "./components/ProgressDots";
import { samplePapers } from "./data/papers";

const CARDS_PER_PAPER = 5;

function useSwipeState() {
  const [paperIndex, setPaperIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const swipeStartY = useRef<number | null>(null);

  const nextCard = useCallback(() => {
    setCardIndex((current) => {
      const next = current + 1;
      if (next < CARDS_PER_PAPER) {
        return next;
      }
      setPaperIndex((paper) => (paper + 1) % samplePapers.length);
      return 0;
    });
  }, []);

  const prevCard = useCallback(() => {
    setCardIndex((current) => Math.max(current - 1, 0));
  }, []);

  const nextPaper = () => {
    setPaperIndex((current) => (current + 1) % samplePapers.length);
    setCardIndex(0);
  };

  const handleTouchStart = useCallback((event: TouchEvent) => {
    swipeStartY.current = event.touches[0]?.clientY ?? null;
  }, []);

  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      if (swipeStartY.current === null) return;

      const deltaY = (event.changedTouches[0]?.clientY ?? 0) - swipeStartY.current;
      const SWIPE_THRESHOLD = 50;

      if (deltaY <= -SWIPE_THRESHOLD) {
        nextCard();
      } else if (deltaY >= SWIPE_THRESHOLD) {
        prevCard();
      }

      swipeStartY.current = null;
    },
    [nextCard, prevCard]
  );

  return {
    paperIndex,
    cardIndex,
    nextCard,
    prevCard,
    nextPaper,
    handleTouchStart,
    handleTouchEnd,
  };
}

export default function App() {
  const { paperIndex, cardIndex, handleTouchEnd, handleTouchStart } = useSwipeState();
  const paper = samplePapers[paperIndex];

  const card = useMemo(() => paper.cards[cardIndex], [cardIndex, paper.cards]);

  return (
    <main className="app">
      <div className="card-frame" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <CardView card={card} />
        <ProgressDots total={paper.cards.length} activeIndex={cardIndex} />
      </div>
    </main>
  );
}
