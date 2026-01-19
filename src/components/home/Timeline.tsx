import { timeline } from "../../data/home";

export default function Timeline() {
  return (
    <div className="relative h-[300vh] w-full">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-max text-center">
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
            {timeline.researchTitle}
          </h3>
          <p className="text-sm text-muted-foreground">{timeline.researchSubtitle}</p>
        </div>
      </div>
      <div className="absolute flex flex-col items-center" style={{ pointerEvents: "none" }}>
        <div className="mt-8 text-center">
          <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            {timeline.buildTitle}
          </h3>
          <p className="text-muted-foreground mt-2 max-w-xs mx-auto mb-6">{timeline.buildSubtitle}</p>
        </div>
      </div>
    </div>
  );
}
