import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { WhyUsAccordion } from '../_components/why-us-accordion';
import { LEADERSHIP } from '@/lib/landing-data';
import type { Trait } from '@/lib/landing-data';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('landing.about.meta');
  return { title: t('title'), description: t('description') };
}

type Concern = { title: string; body: string };
type WhyUsItem = { title: string; body: string };

export default async function AboutPage() {
  const t = await getTranslations('landing.about');
  const tShared = await getTranslations('landing.shared');

  const storyParagraphs = t.raw('story.paragraphs') as string[];
  const concerns = t.raw('parentConcerns.items') as Concern[];
  const whyUsRaw = tShared.raw('whyUs.items') as WhyUsItem[];
  const traits: Trait[] = whyUsRaw.map((i) => ({ title: i.title, description: i.body }));

  return (
    <main className="page">
      {/* ─── HERO (image-only) ─── */}
      <section className="about-hero" aria-label="About page hero image" />

      {/* ─── ORIGIN STORY ─── */}
      <section className="section about-story">
        <div className="about-story-text">
          <span className="eyebrow">{t('story.kicker')}</span>
          <h2>{t('story.heading')}</h2>
          {storyParagraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="about-story-image">
          <div className="about-story-placeholder" aria-label="Origin story image" />
        </div>
      </section>

      {/* ─── PARENT CONCERNS ─── */}
      <section className="section">
        <header className="section-header">
          <span className="eyebrow">{t('parentConcerns.kicker')}</span>
          <h2>{t('parentConcerns.heading')}</h2>
          <p className="section-subtitle">{t('parentConcerns.intro')}</p>
        </header>
        <div className="about-concerns-grid">
          {concerns.map((c, i) => (
            <article key={i} className="about-concern-card">
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </article>
          ))}
        </div>
        <p className="about-concerns-closing">{t('parentConcerns.closing')}</p>
      </section>

      {/* ─── WHY US ─── */}
      <section className="section">
        <header className="section-header">
          <span className="eyebrow">{tShared('whyUs.kicker')}</span>
          <h2>{tShared('whyUs.heading')}</h2>
        </header>
        <WhyUsAccordion traits={traits} variant="compact" />
      </section>

      {/* ─── LEADERSHIP ─── */}
      <section className="section about-leadership">
        <header className="section-header">
          <span className="eyebrow">{t('leadership.kicker')}</span>
          <h2>{t('leadership.heading')}</h2>
          <p className="section-subtitle">{t('leadership.body')}</p>
        </header>
        <div className="about-leadership-grid">
          {LEADERSHIP.map((member) => (
            <article key={member.name} className="about-leader-card">
              <div
                className="about-leader-photo"
                style={{ backgroundImage: `url(${member.photo})` }}
                aria-label={`Photo of ${member.name}`}
              />
              <div className="about-leader-info">
                <h3>{member.name}</h3>
                <p className="about-leader-role">{member.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
