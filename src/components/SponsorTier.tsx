type Tier = {
  name: string;
  price: string;
  perks: string[];
};

export default function SponsorTier({ tier }: { tier: Tier }) {
  return (
    <div className="glass p-6 rounded-xl border border-white/10">
      <h3 className="font-semibold text-lg">{tier.name}</h3>
      <p className="text-sm text-muted-foreground mt-1">{tier.price}</p>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {tier.perks.map((perk) => (
          <li key={perk}>• {perk}</li>
        ))}
      </ul>
    </div>
  );
}
