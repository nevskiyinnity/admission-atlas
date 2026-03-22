import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { WhyUsAccordion } from '../_components/why-us-accordion';
import { PricingCards } from '../_components/pricing-cards';
import { ReviewsCarousel } from '../_components/reviews-carousel';
import { CounselorCard } from '../_components/counselor-card';
import { WHY_US_TRAITS, PRICING_TIERS, REVIEWS, COUNSELORS, PHASES } from '@/lib/landing-data';

export const metadata: Metadata = {
  title: 'SAJU College Admissions | Counseling for 8th-12th Grade Students',
  description:
    'Comprehensive college admissions counseling — from initial consultation through submission. 5-phase process with bi-weekly feedback, peer review, and personalized strategy.',
};

export default function CollegeAdmissionsPage() {
  return (
    <main className="page">
      {/* ─── HERO ─── */}
      <section className="ca-hero">
        <div className="ca-hero-inner">
          <span className="eyebrow">College Admissions</span>
          <h1>
            College Admissions Counseling for 8th&#8209;12th Grade Students
          </h1>
          <p className="ca-hero-desc">
            Maximize your chances with a structured, milestone-based process
            that covers every dimension of the admissions cycle — from initial
            diagnostic through final submission.
          </p>
          <Link className="btn-primary btn-lg" href="/contact">
            Book an Initial Consultation
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </section>

      {/* ─── WHY US ─── */}
      <section className="section">
        <header className="section-header">
          <span className="eyebrow">Differentiators</span>
          <h2>Why Choose SAJU Admissions Counseling?</h2>
        </header>
        <WhyUsAccordion traits={WHY_US_TRAITS} variant="detailed" />
      </section>

      {/* ─── PHASES OVERVIEW ─── */}
      <section className="section ca-phases-overview">
        <header className="section-header">
          <span className="eyebrow">Our Process</span>
          <h2>A Complete 5-Phase Admissions System</h2>
        </header>
        <p className="ca-overview-text">
          Every student engagement follows a structured 5-phase process with
          bi-weekly feedback meetings, peer review from multiple counselors, and
          support from our Neural Engine. You can enroll in the full bundle or
          select individual phases based on your needs.
        </p>
        <nav className="ca-phase-nav" aria-label="Phase navigation">
          {PHASES.map((phase) => (
            <a key={phase.id} href={`#${phase.id}`} className="ca-phase-link">
              {phase.title}
            </a>
          ))}
        </nav>
      </section>

      {/* ─── PHASE DETAILS ─── */}
      <section className="section ca-phase-details">
        {PHASES.map((phase) => (
          <article key={phase.id} id={phase.id} className="ca-phase">
            <div className="ca-phase-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={phase.image}
                alt={phase.title}
                loading="lazy"
              />
            </div>
            <div className="ca-phase-content">
              <h3>{phase.title}</h3>
              <p>{phase.description}</p>
              <ul className="ca-phase-traits">
                {phase.traits.map((trait) => (
                  <li key={trait}>{trait}</li>
                ))}
              </ul>
              {phase.hasButtons && (
                <div className="ca-phase-actions">
                  <Link className="btn-primary" href="/contact">
                    Book an Initial Consultation
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
          <span className="eyebrow">Programs</span>
          <h2>Matched to your timeline</h2>
        </header>
        <PricingCards tiers={PRICING_TIERS} />
      </section>

      {/* ─── COUNSELORS PREVIEW ─── */}
      <section className="section ca-counselors-preview">
        <header className="section-header ca-counselors-header">
          <span className="eyebrow">Our Team</span>
          <h2>Meet Some of Our Expert College Admissions Counselors</h2>
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
            Full Counselor List
          </Link>
        </div>
      </section>

      {/* ─── REVIEWS ─── */}
      <section className="section">
        <header className="section-header">
          <span className="eyebrow">Testimonials</span>
          <h2>What our students and families say</h2>
        </header>
        <ReviewsCarousel reviews={REVIEWS} />
        <div className="ca-reviews-cta">
          <Link className="btn-outline" href="/results">
            More Details
          </Link>
        </div>
      </section>
    </main>
  );
}
