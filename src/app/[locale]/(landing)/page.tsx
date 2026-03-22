import type { Metadata } from 'next';
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
import { REVIEWS, PRICING_TIERS, HOME_FAQ } from '@/lib/landing-data';

export const metadata: Metadata = {
  title: 'SAJU 双岸教育 | Strategic University Admissions Counseling',
  description:
    'SAJU helps students and families build a defensible admissions strategy — school list architecture, major-fit positioning, essay direction, and budget-aware execution.',
};

export default function LandingHomePage() {
  return (
    <>
      {/* Ambient grain */}
      <div className="h-grain" />

      <SmoothScrollProvider>
        <ScrollProgressBar />
        <main className="shell">
          {/* ─── HERO ─── */}
          <HeroEntrance>
            <section className="h-hero">
              <div className="h-hero-orb h-hero-orb--1" aria-hidden="true" />
              <div className="h-hero-orb h-hero-orb--2" aria-hidden="true" />
              <span className="h-badge">Strategic admissions counsel</span>
              <h1>
                Admissions strategy{' '}
                built to <em>hold&nbsp;up</em>
              </h1>
              <p className="h-hero-desc">
                We architect school lists, position narratives, and manage
                execution across regions and budgets — so nothing is left to
                chance.
              </p>
              <div className="h-hero-actions">
                <MagneticButton>
                  <Link className="h-btn-primary" href="/contact">
                    Talk to an Expert
                    <span className="h-btn-arrow" aria-hidden="true">
                      &rarr;
                    </span>
                  </Link>
                </MagneticButton>
                <Link className="h-btn-ghost" href="/neural-engine">
                  University Match Engine
                </Link>
              </div>
            </section>
          </HeroEntrance>

          {/* ─── METRICS ─── */}
          <AnimatedSection>
            <section className="h-metrics">
              <div className="h-metric">
                <strong>4-Phase</strong>
                <span>System</span>
              </div>
              <div className="h-metric">
                <strong>1 : 1</strong>
                <span>Advisor Ratio</span>
              </div>
              <div className="h-metric">
                <strong>30+</strong>
                <span>Countries</span>
              </div>
              <div className="h-metric">
                <strong>100%</strong>
                <span>Cost-Integrated</span>
              </div>
            </section>
          </AnimatedSection>

          {/* ─── WHO WE ARE ─── */}
          <AnimatedSection>
            <section className="h-sect h-who-we-are">
              <div className="h-sect-head">
                <span className="h-kicker">Who We Are</span>
                <h2>The World&apos;s Premier College Consultants</h2>
              </div>
              <p className="h-sect-sub">
                SAJU combines admissions strategists, essay specialists, and student-success
                advisors who deliver structured, data-driven guidance from start to submission.
              </p>
              <Link className="h-btn-outline" href="/counselors">
                Meet Our Counselors
              </Link>
            </section>
          </AnimatedSection>

          {/* ─── SERVICES ─── */}
          <AnimatedSection>
            <section id="services" className="h-sect">
              <div className="h-sect-head">
                <span className="h-kicker">What We Do</span>
                <h2>
                  Full-spectrum strategy — not disconnected advice
                </h2>
                <svg className="h-accent h-accent--diamond h-accent--tr" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="6" y="6" width="12" height="12" transform="rotate(45 12 12)" fill="none" stroke="currentColor" strokeWidth="1"/>
                </svg>
                <svg className="h-accent h-accent--ring h-accent--bl" viewBox="0 0 32 32" aria-hidden="true">
                  <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="1"/>
                </svg>
              </div>
              <p className="h-sect-sub">
                Every engagement follows a structured system. Nothing gets
                missed. Every dollar of tuition exposure is intentional.
              </p>

              {/* Bento grid — 2 wide + 4 narrow */}
              <div className="h-bento">
                <TiltCard className="h-bento-wide">
                  <article className="h-bento-card">
                    <span className="h-bento-num">01</span>
                    <h3>School List Architecture</h3>
                    <p>
                      Balanced across regions, risk tiers, and what you can
                      actually afford — not a top-heavy wish list.
                    </p>
                  </article>
                </TiltCard>
                <TiltCard className="h-bento-wide">
                  <article className="h-bento-card">
                    <span className="h-bento-num">02</span>
                    <h3>Major-Fit Positioning</h3>
                    <p>
                      We translate coursework, projects, and activities into the
                      signals departments actually evaluate.
                    </p>
                  </article>
                </TiltCard>
                <TiltCard>
                  <article className="h-bento-card">
                    <span className="h-bento-num">03</span>
                    <h3>Narrative Strategy</h3>
                    <p>
                      CV preparation, personal statements, and supplemental essays
                      that demonstrate direction and depth — not platitudes.
                    </p>
                  </article>
                </TiltCard>
                <TiltCard>
                  <article className="h-bento-card">
                    <span className="h-bento-num">04</span>
                    <h3>Execution Management</h3>
                    <p>
                      Deadlines, drafts, revision cycles, and interview preparation
                      on a single visible timeline.
                    </p>
                  </article>
                </TiltCard>
                <TiltCard>
                  <article className="h-bento-card">
                    <span className="h-bento-num">05</span>
                    <h3>Budget &amp; Aid</h3>
                    <p>
                      Tuition, aid probability, and scholarship odds — compared
                      upfront, not after you fall in love with a school.
                    </p>
                  </article>
                </TiltCard>
                <TiltCard>
                  <article className="h-bento-card">
                    <span className="h-bento-num">06</span>
                    <h3>Family Decisions</h3>
                    <p>
                      Trade-offs made explicit so decisions stay grounded in data.
                    </p>
                  </article>
                </TiltCard>
              </div>
            </section>
          </AnimatedSection>

          {/* ─── PROCESS (horizontal timeline) ─── */}
          <AnimatedSection>
            <section id="process" className="h-sect">
              <div className="h-sect-head">
                <span className="h-kicker">How It Works</span>
                <h2>Diagnostic to submission</h2>
                <svg className="h-accent h-accent--ring h-accent--tr" viewBox="0 0 32 32" aria-hidden="true">
                  <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="1"/>
                </svg>
              </div>
              <div className="h-timeline">
                <div className="h-timeline-track" aria-hidden="true" />
                <article className="h-tl-step">
                  <div className="h-tl-dot" />
                  <span className="h-tl-label">01</span>
                  <h3>Diagnostic Review</h3>
                  <p>
                    Profile, goals, constraints, and strategic baseline — mapped
                    in one session.
                  </p>
                </article>
                <article className="h-tl-step">
                  <div className="h-tl-dot" />
                  <span className="h-tl-label">02</span>
                  <h3>Portfolio Design</h3>
                  <p>
                    School list and application strategy built across regions,
                    tiers, and budgets.
                  </p>
                </article>
                <article className="h-tl-step">
                  <div className="h-tl-dot" />
                  <span className="h-tl-label">03</span>
                  <h3>Narrative &amp; Materials</h3>
                  <p>
                    Personal narrative, essays, and supplementals — drafted,
                    reviewed, and refined.
                  </p>
                </article>
                <article className="h-tl-step">
                  <div className="h-tl-dot" />
                  <span className="h-tl-label">04</span>
                  <h3>Submission Control</h3>
                  <p>
                    Pre-submit checks for coherence, fit signal, and quality
                    under deadline.
                  </p>
                </article>
                <article className="h-tl-step">
                  <div className="h-tl-dot" />
                  <span className="h-tl-label">05</span>
                  <h3>Phases &amp; Initial Consultation</h3>
                  <p>
                    Begin with Neural Engine assessment and initial consultation to map your
                    personalized phase-by-phase plan.
                  </p>
                </article>
              </div>
              <div className="h-timeline-cta">
                <Link className="h-btn-outline" href="/college-admissions">
                  Learn More
                </Link>
              </div>
            </section>
          </AnimatedSection>

          {/* ─── AI ENGINE CALLOUT ─── */}
          <AnimatedSection>
            <section className="h-callout">
              <div className="h-callout-inner">
                <span className="h-kicker h-kicker--light">Free Tool</span>
                <h2>Neural Match Engine</h2>
                <p>
                  Input your profile, target school, and budget. Our AI scores
                  your fit and suggests alternatives worldwide — instant, no
                  sign-up.
                </p>
                <Link className="h-btn-light" href="/neural-engine">
                  Launch the Engine
                  <span className="h-btn-arrow" aria-hidden="true">
                    &rarr;
                  </span>
                </Link>
              </div>
            </section>
          </AnimatedSection>

          {/* ─── OUTCOMES (teal/green dark) ─── */}
          <AnimatedSection>
            <section id="outcomes" className="h-dark-sect h-dark-sect--teal">
              <div className="h-dark-inner">
                <div className="h-dark-grain" aria-hidden="true" />
                <div className="h-dark-glow h-dark-glow--1" aria-hidden="true" />
                <div className="h-dark-glow h-dark-glow--2" aria-hidden="true" />
                <span className="h-kicker h-kicker--light">
                  Our Impact
                </span>
                <h2>When the process is rigorous</h2>
                <p className="h-dark-sub">
                  Main student improvements compared to applying by themselves
                </p>
                <div className="h-outcomes">
                  <article className="h-outcome">
                    <span className="h-outcome-icon" aria-hidden="true">
                      &#x25C7;
                    </span>
                    <h3>Sharper School Lists</h3>
                    <p>
                      From top-heavy guesswork to balanced portfolios with
                      realistic alternatives across regions.
                    </p>
                  </article>
                  <article className="h-outcome">
                    <span className="h-outcome-icon" aria-hidden="true">
                      &#x25C7;
                    </span>
                    <h3>Stronger Major-Fit Signal</h3>
                    <p>
                      Tighter alignment between your profile and what target
                      programs actually evaluate.
                    </p>
                  </article>
                  <article className="h-outcome">
                    <span className="h-outcome-icon" aria-hidden="true">
                      &#x25C7;
                    </span>
                    <h3>Cleaner Execution</h3>
                    <p>
                      Milestone-based workflows eliminate rushed drafts and
                      avoidable errors.
                    </p>
                  </article>
                  <article className="h-outcome">
                    <span className="h-outcome-icon" aria-hidden="true">
                      &#x25C7;
                    </span>
                    <h3>Higher Decision Confidence</h3>
                    <p>
                      Families choose with clearer trade-offs across selectivity,
                      cost, and outcomes.
                    </p>
                  </article>
                </div>
              </div>
            </section>
          </AnimatedSection>

          {/* ─── REVIEWS ─── */}
          <AnimatedSection>
            <section className="h-sect h-reviews-sect">
              <div className="h-sect-head">
                <span className="h-kicker">Testimonials</span>
                <h2>Our students are at the heart of everything we do.</h2>
              </div>
              <ReviewsCarousel reviews={REVIEWS} />
              <div className="h-reviews-cta">
                <Link className="h-btn-outline" href="/results">
                  More Details
                </Link>
              </div>
            </section>
          </AnimatedSection>

          {/* ─── PRICING ─── */}
          <AnimatedSection>
            <section className="h-sect">
              <div className="h-sect-head">
                <span className="h-kicker">Programs</span>
                <h2>Matched to your timeline</h2>
                <svg className="h-accent h-accent--diamond h-accent--tl" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="6" y="6" width="12" height="12" transform="rotate(45 12 12)" fill="none" stroke="currentColor" strokeWidth="1"/>
                </svg>
              </div>
              <PricingCards tiers={PRICING_TIERS} />
            </section>
          </AnimatedSection>

          {/* ─── FAQ ─── */}
          <AnimatedSection>
            <section className="h-sect">
              <div className="h-sect-head">
                <span className="h-kicker">FAQ</span>
              </div>
              <FAQSection heading="Common questions, direct answers" items={HOME_FAQ} />
            </section>
          </AnimatedSection>

          {/* ─── FINAL CTA ─── */}
          <AnimatedSection>
            <section className="h-final">
              <div className="h-final-glow" aria-hidden="true" />
              <h2>Ready to build your strategy?</h2>
              <p>
                Share your profile, target majors, and budget range. SAJU will
                map the strongest path for your application cycle.
              </p>
              <MagneticButton>
                <Link className="h-btn-primary h-btn-lg" href="/contact">
                  Book a Consultation
                  <span className="h-btn-arrow" aria-hidden="true">
                    &rarr;
                  </span>
                </Link>
              </MagneticButton>
            </section>
          </AnimatedSection>
        </main>
      </SmoothScrollProvider>
    </>
  );
}
