import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { CaseStudyCard } from '../_components/case-study-card';
import { CASE_STUDIES } from '@/lib/landing-data';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('landing.results.meta');
  return { title: t('title'), description: t('description') };
}

type BeforeAfterItem = { label: string; before: string; after: string };
type Step = { num: string; title: string; body: string };

export default async function ResultsPage() {
  const t = await getTranslations('landing.results');

  const baItems = t.raw('beforeAfter.items') as BeforeAfterItem[];
  const steps = t.raw('steps.items') as Step[];

  return (
    <main className="page">
      {/* ─── HERO ─── */}
      <section className="results-hero">
        <span className="eyebrow">{t('hero.kicker')}</span>
        <h1>{t('hero.heading')}</h1>
        <p className="lead">{t('hero.body')}</p>
        <div className="btn-row">
          <Link className="btn-primary" href="/contact">
            {t('hero.ctaPrimary')}
          </Link>
          <Link className="btn-ghost" href="/neural-engine">
            {t('hero.ctaSecondary')}
          </Link>
        </div>
      </section>

      {/* ─── CASE STUDIES ─── */}
      <section className="section">
        <div className="section-head">
          <span className="eyebrow">{t('cases.kicker')}</span>
          <h2>{t('cases.heading')}</h2>
        </div>
        <div className="results-case-grid">
          {CASE_STUDIES.map((study) => (
            <CaseStudyCard key={study.name} study={study} />
          ))}
        </div>
      </section>

      {/* ─── BEFORE / AFTER ─── */}
      <section className="section">
        <div className="section-head">
          <span className="eyebrow">{t('beforeAfter.kicker')}</span>
          <h2>{t('beforeAfter.heading')}</h2>
        </div>
        <div className="results-ba-grid">
          {baItems.map((item, i) => (
            <article key={i} className="results-ba-card">
              {item.label && <h4 className="results-ba-label-heading">{item.label}</h4>}
              <div className="results-ba-side results-ba-before">
                <span className="results-ba-label">Before</span>
                <p>{item.before}</p>
              </div>
              <div className="results-ba-arrow" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </div>
              <div className="results-ba-side results-ba-after">
                <span className="results-ba-label">After</span>
                <p>{item.after}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ─── YOUR STEPS ─── */}
      <section className="section">
        <div className="section-head">
          <span className="eyebrow">{t('steps.kicker')}</span>
          <h2>{t('steps.heading')}</h2>
        </div>
        <div className="results-steps">
          {steps.map((step) => (
            <article key={step.num} className="results-step">
              <span className="results-step-num">{step.num}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="results-steps-cta">
          <Link className="btn-primary" href="/neural-engine">
            {t('steps.cta')}
          </Link>
        </div>
      </section>
    </main>
  );
}
