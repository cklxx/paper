import { useMemo, useState } from "react";
import { CardView } from "./components/CardView";
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
  const { paperIndex, cardIndex } = useSwipeState();
  const paper = samplePapers[paperIndex];

  const card = useMemo(() => paper.cards[cardIndex], [cardIndex, paper.cards]);

  return (
    <main className="app">
      <div className="card-frame">
        <CardView card={card} />
      </div>
    </main>
  );
}
