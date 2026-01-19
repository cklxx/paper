import ReviewCard from "../components/ReviewCard";
import { reviews } from "../data/reviews";

export default function Reviews() {
  return (
    <div className="container mx-auto px-4 py-6 md:py-8 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">评测</h1>
      <p className="text-muted-foreground mt-1 text-sm md:text-base">实现过程、坑点和评分。</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}
