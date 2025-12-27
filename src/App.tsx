import { useMemo, useState } from "react";
import { CardView } from "./components/CardView";
import { samplePapers } from "./data/papers";
import {
  ACTIVE_USER_ID,
  collaborativeFeedback,
  rankPapersForUser,
} from "./data/recommendations";

const CARDS_PER_PAPER = 5;
const rankedPapers = rankPapersForUser(
  samplePapers,
  collaborativeFeedback,
  ACTIVE_USER_ID,
);

function useSwipeState(totalPapers: number) {
  const [paperIndex, setPaperIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);

  const nextCard = () => {
    setCardIndex((current) => {
      const next = current + 1;
      if (next < CARDS_PER_PAPER) {
        return next;
      }
      setPaperIndex((paper) => (paper + 1) % totalPapers);
      return 0;
    });
  };

  const prevCard = () => {
    setCardIndex((current) => Math.max(current - 1, 0));
  };

  const nextPaper = () => {
    setPaperIndex((current) => (current + 1) % totalPapers);
    setCardIndex(0);
  };

  return { paperIndex, cardIndex, nextCard, prevCard, nextPaper };
}

export default function App() {
  const { paperIndex, cardIndex } = useSwipeState(rankedPapers.length);
  const paper = rankedPapers[paperIndex];

  const card = useMemo(() => paper.cards[cardIndex], [cardIndex, paper]);

  return (
    <main className="app">
      <div className="card-frame">
        <CardView card={card} />
      </div>
    </main>
  );
}
