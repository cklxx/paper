import type { Card } from "../data/types";

type CardViewProps = {
  card: Card;
};

const cardClassNames: Record<Card["type"], string> = {
  hook: "card card-hook",
  intuition: "card card-intuition",
  method: "card card-method",
  tradeoff: "card card-tradeoff",
  who: "card card-who",
  source: "card card-source",
};

export function CardView({ card }: CardViewProps) {
  if (card.type === "hook") {
    return (
      <section className={cardClassNames[card.type]} aria-label="Hook card">
        <p className="eyebrow">一句话暴击</p>
        <h1>{card.text}</h1>
      </section>
    );
  }

  if (card.type === "intuition") {
    return (
      <section className={cardClassNames[card.type]} aria-label="Intuition card">
        <p className="eyebrow">反直觉点</p>
        <p className="body-lg">{card.text}</p>
      </section>
    );
  }

  if (card.type === "method") {
    return (
      <section className={cardClassNames[card.type]} aria-label="Method card">
        <p className="eyebrow">他们真正做的事</p>
        <ol>
          {card.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
    );
  }

  if (card.type === "tradeoff") {
    return (
      <section className={cardClassNames[card.type]} aria-label="Tradeoff card">
        <p className="eyebrow">结果 & 代价</p>
        <div className="pill good">✅ {card.good}</div>
        <div className="pill bad">⚠️ {card.bad}</div>
      </section>
    );
  }

  if (card.type === "source") {
    return (
      <section className={cardClassNames[card.type]} aria-label="Source card">
        <p className="eyebrow">滑到最后，直达原文</p>
        <h1>{card.title}</h1>
        <a className="paper-source" href={card.url} target="_blank" rel="noreferrer">
          打开文章地址
        </a>
      </section>
    );
  }

  return (
    <section className={cardClassNames[card.type]} aria-label="Who card">
      <p className="eyebrow">你要不要在意</p>
      <div className="who-row">
        <div className="pill good">✔ {card.do}</div>
        <div className="pill bad">✘ {card.skip}</div>
      </div>
    </section>
  );
}
