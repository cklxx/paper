type ProgressDotsProps = {
  total: number;
  activeIndex: number;
};

export function ProgressDots({ total, activeIndex }: ProgressDotsProps) {
  return (
    <div className="progress-dots" aria-label="Card progress">
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className={index === activeIndex ? "dot active" : "dot"}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
