import { Link } from '@/i18n/routing';
import type { PricingTier } from '@/lib/landing-data';

interface PricingCardsProps {
  tiers: PricingTier[];
}

export function PricingCards({ tiers }: PricingCardsProps) {
  return (
    <div className="pricing-cards">
      {tiers.map((tier) => (
        <article key={tier.name} className={`pricing-card ${tier.popular ? 'pricing-card--popular' : ''}`}>
          {tier.popular && <div className="pricing-badge">Most Popular</div>}
          <span className="pricing-tier">{tier.tier}</span>
          <h3>{tier.name}</h3>
          <ul>
            {tier.features.map((f) => <li key={f}>{f}</li>)}
          </ul>
          <Link href={tier.ctaHref} className={tier.popular ? 'pricing-btn-primary' : 'pricing-btn-outline'}>
            {tier.ctaText}
          </Link>
        </article>
      ))}
    </div>
  );
}
