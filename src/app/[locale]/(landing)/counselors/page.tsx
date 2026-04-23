import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { CounselorCard } from '../_components/counselor-card';
import { COUNSELORS } from '@/lib/landing-data';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('landing.counselors.meta');
  return { title: t('title'), description: t('description') };
}

type Principle = { title: string; body: string };
type Region = { name: string; universities: string[] };

export default async function CounselorsPage() {
  const t = await getTranslations('landing.counselors');

  const principles = t.raw('principles.items') as Principle[];
  const regions = t.raw('regions.items') as Region[];

  return (
    <main className="page">
      {/* ─── HEADER ─── */}
      <section className="section counselors-hero-section">
        <header className="section-header">
          <span className="eyebrow">{t('hero.kicker')}</span>
          <h1>{t('hero.heading')}</h1>
        </header>
        <p className="counselors-intro">{t('hero.body')}</p>
      </section>

      {/* ─── COUNSELOR CARDS ─── */}
      <section className="section">
        <div className="counselors-page-grid">
          {COUNSELORS.map((c) => (
            <CounselorCard key={c.name} counselor={c} />
          ))}
        </div>
      </section>

      {/* ─── OPERATING PRINCIPLES ─── */}
      <section className="section">
        <header className="section-header">
          <span className="eyebrow">{t('principles.kicker')}</span>
          <h2>{t('principles.heading')}</h2>
        </header>
        <div className="principles-list principles-grid-2col">
          {principles.map((p, i) => (
            <div key={p.title} className="principle">
              <div className="principle-num">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="principle-body">
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── EUROPEAN REGIONS ─── */}
      <section className="section">
        <header className="section-header">
          <span className="eyebrow">{t('regions.kicker')}</span>
          <h2>{t('regions.heading')}</h2>
        </header>
        <div className="counselors-regions-grid">
          {regions.map((r) => (
            <article key={r.name} className="counselors-region-card">
              <h3>{r.name}</h3>
              <ul>
                {r.universities.map((u, i) => (
                  <li key={i}>{u}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="final-cta">
        <h2>{t('finalCta.heading')}</h2>
        <p>{t('finalCta.body')}</p>
        <Link className="btn-primary btn-lg" href="/contact">
          {t('finalCta.cta')} <span aria-hidden="true">&rarr;</span>
        </Link>
      </section>
    </main>
  );
}
