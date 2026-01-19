import SponsorTier from "../components/SponsorTier";
import { sponsorTiers } from "../data/sponsors";

export default function Sponsors() {
  return (
    <div className="container mx-auto px-4 py-6 md:py-8 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">赞助</h1>
      <p className="text-muted-foreground mt-1 text-sm md:text-base">一起把路线做得更完整。</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {sponsorTiers.map((tier) => (
          <SponsorTier key={tier.name} tier={tier} />
        ))}
      </div>
    </div>
  );
}
