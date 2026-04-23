import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { SmoothScrollProvider } from './_components/smooth-scroll-provider';
import { AnimatedSection } from './_components/animated-section';
import { HeroEntrance } from './_components/hero-entrance';
import { ScrollProgressBar } from './_components/scroll-progress-bar';
import { MagneticButton } from './_components/magnetic-button';
import { TiltCard } from './_components/tilt-card';
import { ReviewsCarousel } from './_components/reviews-carousel';
import { PricingCards } from './_components/pricing-cards';
import { FAQSection } from './_components/faq-section';
import { REVIEWS } from '@/lib/landing-data';
import type { PricingTier } from '@/lib/landing-data';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('landing.home.meta');
  return { title: t('title'), description: t('description') };
}

type Metric = { value: string; label: string };
type ServiceItem = { num: string; title: string; body: string };
type Phase = { label: string; title: string; body: string };
type Outcome = { title: string; body: string };

export default async function LandingHomePage() {
  const t = await getTranslations('landing.home');

  const metrics = t.raw('metrics') as Metric[];
  const services = t.raw('services.items') as ServiceItem[];
  const phases = t.raw('process.phases') as Phase[];
  const outcomes = t.raw('outcomes.items') as Outcome[];
  const pricingTiers = t.raw('pricing.tiers') as PricingTier[];
  const faqRaw = t.raw('faq.items') as { q: string; a: string }[];
  const faqItems = faqRaw.map(({ q, a }) => ({ question: q, answer: a }));

  return (
    <>
      <div className="h-grain" />

      <SmoothScrollProvider>
        <ScrollProgressBar />
        <main className="shell">
          {/* ─── HERO ─── */}
          <HeroEntrance>
            <section className="h-hero">
              <div className="h-hero-orb h-hero-orb--1" aria-hidden="true" />
              <div className="h-hero-orb h-hero-orb--2" aria-hidden="true" />
              <span className="h-badge">{t('hero.badge')}</span>
              <h1>{t('hero.heading')}</h1>
              <p className="h-hero-desc">{t('hero.subhead')}</p>
              <div className="h-hero-actions">
                <MagneticButton>
                  <Link className="h-btn-primary" href="/contact">
                    {t('hero.ctaPrimary')}
                    <span className="h-btn-arrow" aria-hidden="true">&rarr;</span>
                  </Link>
                </MagneticButton>
                <Link className="h-btn-ghost" href="/neural-engine">
                  {t('hero.ctaSecondary')}
                </Link>
              </div>
            </section>
          </HeroEntrance>

          {/* ─── METRICS ─── */}
          <AnimatedSection>
            <section className="h-metrics">
              {metrics.map((m, i) => (
                <div key={i} className="h-metric">
                  <strong>{m.value}</strong>
                  <span>{m.label}</span>
                </div>
              ))}
            </section>
          </AnimatedSection>

          {/* ─── WHO WE ARE ─── */}
          <AnimatedSection>
            <section className="h-sect h-who-we-are">
              <div className="h-sect-head">
                <span className="h-kicker">{t('whoWeAre.kicker')}</span>
                <h2>{t('whoWeAre.heading')}</h2>
              </div>
              <p className="h-sect-sub">{t('whoWeAre.body')}</p>
              <Link className="h-btn-outline" href="/counselors">
                {t('whoWeAre.cta')}
              </Link>
            </section>
          </AnimatedSection>

          {/* ─── SERVICES ─── */}
          <AnimatedSection>
            <section id="services" className="h-sect">
              <div className="h-sect-head">
                <span className="h-kicker">{t('services.kicker')}</span>
                <h2>{t('services.heading')}</h2>
                <svg className="h-accent h-accent--diamond h-accent--tr" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="6" y="6" width="12" height="12" transform="rotate(45 12 12)" fill="none" stroke="currentColor" strokeWidth="1" />
                </svg>
                <svg className="h-accent h-accent--ring h-accent--bl" viewBox="0 0 32 32" aria-hidden="true">
                  <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>
              <p className="h-sect-sub">{t('services.subhead')}</p>

              <div className="h-bento">
                {services.map((s, i) => (
                  <TiltCard key={s.num} className={i < 2 ? 'h-bento-wide' : undefined}>
                    <article className="h-bento-card">
                      <span className="h-bento-num">{s.num}</span>
                      <h3>{s.title}</h3>
                      <p>{s.body}</p>
                    </article>
                  </TiltCard>
                ))}
              </div>
            </section>
          </AnimatedSection>

          {/* ─── PROCESS ─── */}
          <AnimatedSection>
            <section id="process" className="h-sect">
              <div className="h-sect-head">
                <span className="h-kicker">{t('process.kicker')}</span>
                <h2>{t('process.heading')}</h2>
                <svg className="h-accent h-accent--ring h-accent--tr" viewBox="0 0 32 32" aria-hidden="true">
                  <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>
              <p className="h-sect-sub">{t('process.subhead')}</p>
              <div className="h-timeline">
                <div className="h-timeline-track" aria-hidden="true" />
                {phases.map((p) => (
                  <article key={p.label} className="h-tl-step">
                    <div className="h-tl-dot" />
                    <span className="h-tl-label">{p.label}</span>
                    <h3>{p.title}</h3>
                    <p>{p.body}</p>
                  </article>
                ))}
              </div>
              <div className="h-timeline-cta">
                <Link className="h-btn-outline" href="/college-admissions">
                  {t('process.cta')}
                </Link>
              </div>
            </section>
          </AnimatedSection>

          {/* ─── AI ENGINE CALLOUT ─── */}
          <AnimatedSection>
            <section className="h-callout">
              <div className="h-callout-inner">
                <span className="h-kicker h-kicker--light">{t('engineCallout.kicker')}</span>
                <h2>{t('engineCallout.heading')}</h2>
                <p>{t('engineCallout.body')}</p>
                <Link className="h-btn-light" href="/neural-engine">
                  {t('engineCallout.cta')}
                  <span className="h-btn-arrow" aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </section>
          </AnimatedSection>

          {/* ─── OUTCOMES ─── */}
          <AnimatedSection>
            <section id="outcomes" className="h-dark-sect h-dark-sect--teal">
              <div className="h-dark-inner">
                <div className="h-dark-grain" aria-hidden="true" />
                <div className="h-dark-glow h-dark-glow--1" aria-hidden="true" />
                <div className="h-dark-glow h-dark-glow--2" aria-hidden="true" />
                <span className="h-kicker h-kicker--light">{t('outcomes.kicker')}</span>
                <h2>{t('outcomes.heading')}</h2>
                <p className="h-dark-sub">{t('outcomes.subhead')}</p>
                <div className="h-outcomes">
                  {outcomes.map((o, i) => (
                    <article key={i} className="h-outcome">
                      <span className="h-outcome-icon" aria-hidden="true">&#x25C7;</span>
                      <h3>{o.title}</h3>
                      <p>{o.body}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </AnimatedSection>

          {/* ─── REVIEWS ─── */}
          <AnimatedSection>
            <section className="h-sect h-reviews-sect">
              <div className="h-sect-head">
                <span className="h-kicker">{t('reviews.kicker')}</span>
                <h2>{t('reviews.heading')}</h2>
              </div>
              <ReviewsCarousel reviews={REVIEWS} />
              <div className="h-reviews-cta">
                <Link className="h-btn-outline" href="/results">
                  {t('reviews.cta')}
                </Link>
              </div>
            </section>
          </AnimatedSection>

          {/* ─── PRICING ─── */}
          <AnimatedSection>
            <section className="h-sect">
              <div className="h-sect-head">
                <span className="h-kicker">{t('pricing.kicker')}</span>
                <h2>{t('pricing.heading')}</h2>
                <svg className="h-accent h-accent--diamond h-accent--tl" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="6" y="6" width="12" height="12" transform="rotate(45 12 12)" fill="none" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>
              <p className="h-sect-sub">{t('pricing.subhead')}</p>
              <PricingCards tiers={pricingTiers} />
            </section>
          </AnimatedSection>

          {/* ─── FAQ ─── */}
          <AnimatedSection>
            <section className="h-sect">
              <div className="h-sect-head">
                <span className="h-kicker">{t('faq.kicker')}</span>
              </div>
              <FAQSection heading={t('faq.heading')} items={faqItems} />
            </section>
          </AnimatedSection>

          {/* ─── FINAL CTA ─── */}
          <AnimatedSection>
            <section className="h-final">
              <div className="h-final-glow" aria-hidden="true" />
              <h2>{t('finalCta.heading')}</h2>
              <p>{t('finalCta.body')}</p>
              <MagneticButton>
                <Link className="h-btn-primary h-btn-lg" href="/contact">
                  {t('finalCta.cta')}
                  <span className="h-btn-arrow" aria-hidden="true">&rarr;</span>
                </Link>
              </MagneticButton>
            </section>
          </AnimatedSection>
        </main>
      </SmoothScrollProvider>
    </>
  );
}
