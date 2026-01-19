import { useEffect, useState } from "react";

type Props = { children: React.ReactNode };

export default function PageTransition({ children }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className="flex-1 w-full transition-all duration-500"
      style={{ opacity: ready ? 1 : 0, transform: ready ? "none" : "translateY(10px)" }}
    >
      {children}
    </div>
  );
}
