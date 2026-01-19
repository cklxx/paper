type Section = { title: string; body: string };

export default function AboutSection({ section }: { section: Section }) {
  return (
    <div className="glass p-6 rounded-xl border border-white/10">
      <h3 className="font-semibold text-lg">{section.title}</h3>
      <p className="text-sm text-muted-foreground mt-2">{section.body}</p>
    </div>
  );
}
