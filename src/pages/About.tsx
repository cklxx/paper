import AboutSection from "../components/AboutSection";
import { aboutSections } from "../data/about";

export default function About() {
  return (
    <div className="container mx-auto px-4 py-6 md:py-8 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">关于</h1>
      <p className="text-muted-foreground mt-1 text-sm md:text-base">我们做的事很简单：帮你实现论文。</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {aboutSections.map((section) => (
          <AboutSection key={section.title} section={section} />
        ))}
      </div>
    </div>
  );
}
