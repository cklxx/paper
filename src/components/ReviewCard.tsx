type Review = {
  title: string;
  summary: string;
  tags: string[];
};

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="glass p-6 rounded-xl border border-white/10">
      <h3 className="font-semibold">{review.title}</h3>
      <p className="text-sm text-muted-foreground mt-2">{review.summary}</p>
      <div className="mt-3 flex gap-2 flex-wrap">
        {review.tags.map((tag) => (
          <span key={tag} className="text-xs text-muted-foreground border border-white/10 rounded-full px-2 py-1">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
