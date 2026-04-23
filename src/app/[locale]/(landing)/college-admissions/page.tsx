import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { WhyUsAccordion } from '../_components/why-us-accordion';
import { PricingCards } from '../_components/pricing-cards';
import { ReviewsCarousel } from '../_components/reviews-carousel';
import { CounselorCard } from '../_components/counselor-card';
import { REVIEWS, COUNSELORS } from '@/lib/landing-data';
import type { Trait, PricingTier } from '@/lib/landing-data';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('landing.collegeAdmissions.meta');
  return { title: t('title'), description: t('description') };
}

type WhyUsItem = { title: string; body: string };
type Phase = {
  id: string;
  number: string;
  title: string;
  objective: string;
  body: string;
  traits: string[];
};

export default async function CollegeAdmissionsPage() {
  const t = await getTranslations('landing.collegeAdmissions');
  const tShared = await getTranslations('landing.shared');
  const tHome = await getTranslations('landing.home');

  const whyUsRaw = tShared.raw('whyUs.items') as WhyUsItem[];
  const traits: Trait[] = whyUsRaw.map((i) => ({ title: i.title, description: i.body }));
  const phases = t.raw('phases') as Phase[];
  const pricingTiers = tHome.raw('pricing.tiers') as PricingTier[];

  return (
    <main className="page">
      {/* ─── HERO ─── */}
      <section className="ca-hero">
        <div className="ca-hero-inner">
          <span className="eyebrow">{t('hero.kicker')}</span>
          <h1>{t('hero.heading')}</h1>
          <p className="ca-hero-desc">{t('hero.body')}</p>
          <Link className="btn-primary btn-lg" href="/contact">
            {t('hero.cta')}
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </section>

      {/* ─── WHY US ─── */}
      <section className="section">
        <header className="section-header">
          <span className="eyebrow">{tShared('whyUs.kicker')}</span>
          <h2>{tShared('whyUs.heading')}</h2>
        </header>
        <WhyUsAccordion traits={traits} variant="detailed" />
      </section>

      {/* ─── PHASES OVERVIEW ─── */}
      <section className="section ca-phases-overview">
        <header className="section-header">
          <span className="eyebrow">{t('phaseOverview.kicker')}</span>
          <h2>{t('phaseOverview.heading')}</h2>
        </header>
        <p className="ca-overview-text">{t('phaseOverview.body')}</p>
        <nav className="ca-phase-nav" aria-label="Phase navigation">
          {phases.map((phase) => (
            <a key={phase.id} href={`#${phase.id}`} className="ca-phase-link">
              {phase.title}
            </a>
          ))}
        </nav>
      </section>

      {/* ─── PHASE DETAILS ─── */}
      <section className="section ca-phase-details">
        {phases.map((phase, i) => (
          <article key={phase.id} id={phase.id} className="ca-phase">
            <div className="ca-phase-img">
              <div className="ca-phase-num-large" aria-hidden="true">{phase.number}</div>
            </div>
            <div className="ca-phase-content">
              <h3>{phase.title}</h3>
              <p className="ca-phase-objective"><strong>{phase.objective}</strong></p>
              <p>{phase.body}</p>
              <ul className="ca-phase-traits">
                {phase.traits.map((trait, j) => (
                  <li key={j}>{trait}</li>
                ))}
              </ul>
              {(i === 0 || i === 3) && (
                <div className="ca-phase-actions">
                  <Link className="btn-primary" href="/contact">
                    {t('hero.cta')}
                  </Link>
                  <Link className="btn-ghost" href="/neural-engine">
                    University Match Engine
                  </Link>
                </div>
              )}
            </div>
          </article>
        ))}
      </section>

      {/* ─── PROGRAMS ─── */}
      <section className="section">
        <header className="section-header">
          <span className="eyebrow">{t('packages.kicker')}</span>
          <h2>{t('packages.heading')}</h2>
        </header>
        <PricingCards tiers={pricingTiers} />
      </section>

      {/* ─── COUNSELORS PREVIEW ─── */}
      <section className="section ca-counselors-preview">
        <header className="section-header ca-counselors-header">
          <span className="eyebrow">{t('counselorsPreview.kicker')}</span>
          <h2>{t('counselorsPreview.heading')}</h2>
        </header>
        <div className="ca-counselors-grid">
          {COUNSELORS.filter((c) => c.name === 'James' || c.name === 'Chris').map(
            (counselor) => (
              <CounselorCard key={counselor.name} counselor={counselor} />
            ),
          )}
        </div>
        <div className="ca-counselors-cta">
          <Link className="btn-outline" href="/counselors">
            {t('counselorsPreview.cta')}
          </Link>
        </div>
      </section>

      {/* ─── REVIEWS ─── */}
      <section className="section">
        <header className="section-header">
          <span className="eyebrow">{t('testimonials.kicker')}</span>
          <h2>{t('testimonials.heading')}</h2>
        </header>
        <ReviewsCarousel reviews={REVIEWS} />
        <div className="ca-reviews-cta">
          <Link className="btn-outline" href="/results">
            {t('testimonials.cta')}
          </Link>
        </div>
      </section>
    </main>
  );
}
