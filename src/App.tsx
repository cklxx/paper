import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { CardView } from "./components/CardView";
import { ProgressDots } from "./components/ProgressDots";
import { samplePapers } from "./data/papers";
import {
  ACTIVE_USER_ID,
  collaborativeFeedback,
  rankPapersForUser,
} from "./data/recommendations";

const SWIPE_THRESHOLD = 28;
const HISTORY_STORAGE_KEY = "paper-history-index";
type SwipeStart = { x: number; y: number };
const rankedPapers = rankPapersForUser(
  samplePapers,
  collaborativeFeedback,
  ACTIVE_USER_ID,
);

function getStoredPaperIndex() {
  if (typeof window === "undefined") return 0;

  const storedValue = window.localStorage.getItem(HISTORY_STORAGE_KEY);
  if (storedValue === null) return 0;

  const parsedIndex = Number.parseInt(storedValue, 10);
  if (Number.isNaN(parsedIndex)) return 0;

  return Math.min(Math.max(parsedIndex, 0), rankedPapers.length - 1);
}

function useCardSwipe(paperIndex: number, getCardCount: (index: number) => number) {
  const [cardIndex, setCardIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragDirection, setDragDirection] = useState<"horizontal" | "vertical" | null>(null);
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

  const resetSwipe = useCallback(() => {
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
    setDragDirection(null);
    swipeStart.current = null;
    activePointerId.current = null;
  }, []);

  const handlePointerDown = useCallback((event: PointerEvent) => {
    activePointerId.current = event.pointerId;
    swipeStart.current = { x: event.clientX, y: event.clientY };
    setIsDragging(true);
    setDragOffset({ x: 0, y: 0 });
    setDragDirection(null);
  }, []);

  const evaluateSwipe = useCallback(
    (deltaX: number, deltaY: number) => {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX < SWIPE_THRESHOLD || absX <= absY) return;

      if (deltaX <= -SWIPE_THRESHOLD) {
        nextCard();
      } else {
        prevCard();
      }
    },
    [nextCard, prevCard],
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      if (activePointerId.current !== event.pointerId) return;
      const start = swipeStart.current;

      if (!start) {
        resetSwipe();
        return;
      }

      const deltaX = event.clientX - start.x;
      const deltaY = event.clientY - start.y;

      evaluateSwipe(deltaX, deltaY);
      resetSwipe();
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
      if (!swipeStart.current) return;

      const deltaX = event.clientX - swipeStart.current.x;
      const deltaY = event.clientY - swipeStart.current.y;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (!dragDirection) {
        if (absX < 6 && absY < 6) return;
        setDragDirection(absX >= absY ? "horizontal" : "vertical");
      }

      if (dragDirection === "vertical") {
        setIsDragging(false);
        setDragOffset({ x: 0, y: 0 });
        return;
      }

      const clampedX = Math.max(Math.min(deltaX, 140), -140);
      const clampedY = Math.max(Math.min(deltaY * 0.2, 40), -40);

      setDragOffset({ x: clampedX, y: clampedY });
    },
    [dragDirection],
  );

  useEffect(() => {
    setCardIndex(0);
    setDragOffset({ x: 0, y: 0 });
  }, [paperIndex]);

  useEffect(() => {
    setCardIndex((current) => {
      const limit = Math.max(getCardCount(paperIndex) - 1, 0);
      return Math.min(current, limit);
    });
  }, [paperIndex, getCardCount]);

  return {
    cardIndex,
    dragOffset,
    isDragging,
    nextCard,
    prevCard,
    handlePointerDown,
    handlePointerUp,
    handlePointerMove,
    handlePointerCancel,
  };
}

export default function App() {
  const getCardCount = useCallback((index: number) => rankedPapers[index].cards.length, []);
  const initialPaperIndex = useMemo(getStoredPaperIndex, []);
  const [paperIndex, setPaperIndex] = useState(initialPaperIndex);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: "y",
    loop: true,
    align: "center",
    startIndex: initialPaperIndex,
  });
  const {
    cardIndex,
    dragOffset,
    isDragging,
    handlePointerUp,
    handlePointerDown,
    handlePointerMove,
    handlePointerCancel,
  } = useCardSwipe(paperIndex, getCardCount);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(HISTORY_STORAGE_KEY, paperIndex.toString());
  }, [paperIndex]);

  useEffect(() => {
    if (!emblaApi) return;

    const updateIndex = () => {
      const currentIndex = emblaApi.selectedScrollSnap();
      setPaperIndex(currentIndex);
    };

    emblaApi.on("select", updateIndex);
    emblaApi.on("reInit", updateIndex);
    updateIndex();

    return () => {
      emblaApi.off("select", updateIndex);
      emblaApi.off("reInit", updateIndex);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    if (emblaApi.selectedScrollSnap() !== paperIndex) {
      emblaApi.scrollTo(paperIndex);
    }
  }, [emblaApi, paperIndex]);

  const cardTransform = `translate3d(${dragOffset.x * 0.18}px, ${dragOffset.y}px, 0) rotate(${dragOffset.x * 0.02}deg)`;
  const cardTransition = isDragging ? "none" : "transform 200ms ease, box-shadow 200ms ease";
  const paper = rankedPapers[paperIndex];
  const activeCard = useMemo(
    () => paper.cards[Math.min(cardIndex, paper.cards.length - 1)],
    [cardIndex, paper],
  );

  return (
    <main className="app">
      <div className="feed" ref={emblaRef} aria-label="Paper vertical feed">
        <div className="feed-track">
          {rankedPapers.map((paperItem, index) => {
            const isActive = index === paperIndex;
            const cardForSlide = isActive
              ? activeCard
              : paperItem.cards[Math.min(cardIndex, paperItem.cards.length - 1)] ?? paperItem.cards[0];
            const handlers = isActive
              ? {
                  onPointerDown: handlePointerDown,
                  onPointerUp: handlePointerUp,
                  onPointerMove: handlePointerMove,
                  onPointerCancel: handlePointerCancel,
                }
              : {};

            return (
              <section className="feed-slide" key={paperItem.title} aria-hidden={!isActive}>
                <div className="card-stack">
                  <div
                    className="card-frame"
                    data-testid={isActive ? "card-frame" : undefined}
                    style={
                      isActive
                        ? { transform: cardTransform, transition: cardTransition }
                        : { transform: "translate3d(0, 12px, 0) scale(0.98)", opacity: 0.92 }
                    }
                    {...handlers}
                  >
                    <div className="card-topbar">
                      <div className="paper-meta">
                        <p className="paper-topic">{paperItem.topic}</p>
                        <h2 className="paper-title" aria-label="paper title">
                          {paperItem.title}
                        </h2>
                        <a
                          className="paper-source"
                          href={paperItem.source.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {paperItem.source.title}
                        </a>
                      </div>
                    </div>

                    <CardView card={cardForSlide} />

                    <div className="card-controls">
                      <ProgressDots total={paperItem.cards.length} activeIndex={isActive ? cardIndex : 0} />
                      <p className="control-hint">左右滑切卡片，上下滑切论文</p>
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
