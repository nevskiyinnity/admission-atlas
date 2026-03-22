import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { CounselorCard } from '../_components/counselor-card';
import { COUNSELORS, OPERATING_PRINCIPLES, GLOBAL_REGIONS } from '@/lib/landing-data';

export const metadata: Metadata = {
  title: 'SAJU Counselors | Meet Our Admissions Team',
  description:
    'Meet the admissions strategists and counselors behind SAJU — their expertise, operating principles, and global reach.',
};

const REGION_FLAGS: Record<string, string> = {
  US: '\u{1F1FA}\u{1F1F8}',
  GB: '\u{1F1EC}\u{1F1E7}',
  SG: '\u{1F1F8}\u{1F1EC}',
};

export default function CounselorsPage() {
  return (
    <main className="page">
      {/* ─── HEADER ─── */}
      <section className="section counselors-hero-section">
        <header className="section-header">
          <span className="eyebrow">Our Counselors</span>
          <h1>The People Behind Your Admissions&nbsp;Strategy</h1>
        </header>
        <p className="counselors-intro">
          SAJU is built by admissions strategists, essay specialists, and
          student-success advisors who combine practical counseling with
          structured decision-making. Every engagement is led by a dedicated
          counselor who owns your strategy end to end.
        </p>
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
          <span className="eyebrow">How We Work</span>
          <h2>Operating principles that shape every engagement</h2>
        </header>
        <div className="principles-list principles-grid-2col">
          {OPERATING_PRINCIPLES.map((p, i) => (
            <div key={p.title} className="principle">
              <div className="principle-num">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="principle-body">
                <h3>{p.title}</h3>
                <p>{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── GLOBAL REACH ─── */}
      <section className="section">
        <header className="section-header">
          <span className="eyebrow">Global Reach</span>
          <h2>Where we support students</h2>
        </header>
        <div className="location-row">
          {GLOBAL_REGIONS.map((r) => (
            <article key={r.code} className="location-card">
              <span className="location-flag">
                {REGION_FLAGS[r.code] ?? '🌍'}
              </span>
              <h3>{r.name}</h3>
              <p>{r.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="final-cta">
        <h2>Meet the team through a strategy session</h2>
        <p>
          Share your profile, target schools, and constraints. We&#39;ll
          recommend an actionable next-step plan — no commitment required.
        </p>
        <Link className="btn-primary btn-lg" href="/contact">
          Book Your Consultation <span aria-hidden="true">&rarr;</span>
        </Link>
      </section>
    </main>
  );
}
