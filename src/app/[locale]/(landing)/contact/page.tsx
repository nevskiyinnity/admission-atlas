import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { FAQSection } from '../_components/faq-section';
import { ContactForm } from './_components/contact-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('landing.contact.meta');
  return { title: t('title'), description: t('description') };
}

type FAQ = { q: string; a: string };

export default async function ContactPage() {
  const t = await getTranslations('landing.contact');

  const faqRaw = t.raw('faq.items') as FAQ[];
  const faqItems = faqRaw.map(({ q, a }) => ({ question: q, answer: a }));
  const channelKeys = ['email', 'phone', 'wechat', 'xiaohongshu', 'office', 'hours'] as const;

  return (
    <main className="page">
      {/* ─── HERO ─── */}
      <section className="contact-hero">
        <p className="eyebrow">{t('hero.kicker')}</p>
        <h1>{t('hero.heading')}</h1>
        <p className="contact-hero-lead">{t('hero.body')}</p>
        <a className="l-btn-primary" href="#inquiry">
          {t('hero.cta')}
        </a>
      </section>

      {/* ─── INQUIRY FORM ─── */}
      <section className="section" id="inquiry">
        <div className="section-head">
          <p className="eyebrow">{t('form.kicker')}</p>
          <h2>{t('form.heading')}</h2>
          <p>{t('form.body')}</p>
        </div>
        <div className="contact-form-container">
          <ContactForm />
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <FAQSection heading={t('faq.heading')} items={faqItems} />

      {/* ─── CONTACT CHANNELS ─── */}
      <section className="section">
        <div className="section-head">
          <p className="eyebrow">{t('channels.kicker')}</p>
          <h2>{t('channels.heading')}</h2>
        </div>
        <div className="contact-channels">
          {channelKeys.map((key) => (
            <div key={key} className="contact-channel-card">
              <h3>{t(`channels.labels.${key}`)}</h3>
              <p>{t(`channels.values.${key}`)}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
