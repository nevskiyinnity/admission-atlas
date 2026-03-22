import type { Metadata } from 'next';
import { WhyUsAccordion } from '../_components/why-us-accordion';
import { WHY_US_TRAITS, LEADERSHIP } from '@/lib/landing-data';

export const metadata: Metadata = {
  title: 'About SAJU 双岸教育 | Our Story and Leadership',
  description:
    "Learn about SAJU's mission, our approach to admissions counseling, and meet the leadership team.",
};

export default function AboutPage() {
  return (
    <main className="page">
      {/* ─── HERO (image-only) ─── */}
      <section className="about-hero" aria-label="About page hero image" />

      {/* ─── ORIGIN STORY ─── */}
      <section className="section about-story">
        <div className="about-story-text">
          <span className="eyebrow">Our Story</span>
          <h2>What Makes the Difference?</h2>
          <p>
            SAJU was born from firsthand experience with the admissions process —
            not just once, but many times over. As someone who has been in the
            applicant position across different systems, countries, and
            expectations, I learned that the difference between a strong outcome
            and a missed opportunity often comes down to structure, timing, and
            honest guidance.
          </p>
          <p>
            Too many students receive advice that is either too generic to act on
            or too focused on prestige to be practical. We started SAJU to
            change that — to build a counseling practice grounded in strategy,
            transparency, and real execution. Every recommendation we make is
            backed by evidence, tailored to the individual, and tested against
            the constraints that actually matter: budget, fit, and long-term
            trajectory.
          </p>
          <p>
            What began as a small group of advisors helping friends and family
            has grown into a structured practice serving students across
            continents. But the core principle remains the same: treat every
            student&apos;s future as seriously as we treated our own.
          </p>
        </div>
        <div className="about-story-image">
          <div className="about-story-placeholder" aria-label="Origin story image" />
        </div>
      </section>

      {/* ─── WHY US (compact) ─── */}
      <section className="section">
        <header className="section-header">
          <span className="eyebrow">Differentiators</span>
          <h2>Why Choose SAJU Admissions Counseling?</h2>
        </header>
        <WhyUsAccordion traits={WHY_US_TRAITS} variant="compact" />
      </section>

      {/* ─── LEADERSHIP ─── */}
      <section className="section about-leadership">
        <header className="section-header">
          <span className="eyebrow">Our Leadership</span>
          <h2>Meet the Team Behind SAJU</h2>
          <p className="section-subtitle">
            At SAJU, our leadership team is united by the mission of helping
            every student find their best-fit path.
          </p>
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
