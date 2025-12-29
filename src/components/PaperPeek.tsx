import type { CSSProperties } from "react";
import type { Paper } from "../data/types";

type PaperPeekProps = {
  paper: Paper;
  direction: "next" | "previous";
  style?: CSSProperties;
};

export function PaperPeek({ paper, direction, style }: PaperPeekProps) {
  const label = direction === "next" ? "下一篇预览" : "上一篇预览";

  return (
    <div className="peek-card" style={style}>
      <p className="eyebrow">{label}</p>
      <p className="paper-topic">{paper.topic}</p>
      <p className="paper-title">{paper.title}</p>
      <a className="paper-source" href={paper.source.url} target="_blank" rel="noreferrer">
        {paper.source.title}
      </a>
    </div>
  );
}
