import type { Metadata } from 'next';
import Link from 'next/link';
import { SmoothScrollProvider } from './_components/smooth-scroll-provider';
import { AnimatedSection } from './_components/animated-section';

export const metadata: Metadata = {
  title: 'Admission Atlas | Strategic University Admissions Counseling',
  description:
    'Admission Atlas helps students and families build a defensible admissions strategy — school list architecture, major-fit positioning, essay direction, and budget-aware execution from start to submission.',
};

export default function LandingHomePage() {
  return (
    <>
      {/* Ambient grain */}
      <div className="h-grain" />

      {/* ─── NAV ─── */}
      <header className="h-nav">
        <div className="h-nav-inner">
          <Link className="h-brand" href="/">
            <span className="h-brand-mark" aria-hidden="true" />
            Admission Atlas
          </Link>
          <nav className="h-nav-links">
            <a href="#services">Services</a>
            <a href="#process">Process</a>
            <a href="#outcomes">Outcomes</a>
            <Link href="/team">Team</Link>
          </nav>
          <div className="h-nav-right">
            <Link href="/login" className="h-nav-login">
              Log in
            </Link>
            <Link href="/contact" className="h-nav-cta">
              Book a Call
            </Link>
          </div>
        </div>
      </header>

      <SmoothScrollProvider>
        <main className="shell">
          {/* ─── HERO ─── */}
          <AnimatedSection>
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
                <Link className="h-btn-primary" href="/contact">
                  Start Your Strategy
                  <span className="h-btn-arrow" aria-hidden="true">
                    &rarr;
                  </span>
                </Link>
                <a className="h-btn-ghost" href="#services">
                  See the Process
                </a>
              </div>
            </section>
          </AnimatedSection>

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
                <article className="h-bento-card h-bento-wide">
                  <span className="h-bento-num">01</span>
                  <h3>School List Architecture</h3>
                  <p>
                    Balanced across regions, risk tiers, and what you can
                    actually afford — not a top-heavy wish list.
                  </p>
                </article>
                <article className="h-bento-card h-bento-wide">
                  <span className="h-bento-num">02</span>
                  <h3>Major-Fit Positioning</h3>
                  <p>
                    We translate coursework, projects, and activities into the
                    signals departments actually evaluate.
                  </p>
                </article>
                <article className="h-bento-card">
                  <span className="h-bento-num">03</span>
                  <h3>Narrative Strategy</h3>
                  <p>
                    Essays that demonstrate direction and depth — not platitudes.
                  </p>
                </article>
                <article className="h-bento-card">
                  <span className="h-bento-num">04</span>
                  <h3>Execution Management</h3>
                  <p>
                    Deadlines, drafts, and revision cycles on a single visible
                    timeline.
                  </p>
                </article>
                <article className="h-bento-card">
                  <span className="h-bento-num">05</span>
                  <h3>Budget &amp; Aid</h3>
                  <p>
                    Tuition, aid probability, and scholarship odds — compared
                    upfront, not after you fall in love with a school.
                  </p>
                </article>
                <article className="h-bento-card">
                  <span className="h-bento-num">06</span>
                  <h3>Family Decisions</h3>
                  <p>
                    Trade-offs made explicit so decisions stay grounded in data.
                  </p>
                </article>
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
              </div>
            </section>
          </AnimatedSection>

          {/* ─── OUTCOMES (alternating dark) ─── */}
          <AnimatedSection>
            <section id="outcomes" className="h-dark-sect">
              <div className="h-dark-inner">
                <span className="h-kicker h-kicker--light">
                  What Structure Changes
                </span>
                <h2>When the process is rigorous</h2>
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
              <div className="h-plans">
                <article className="h-plan-card">
                  <span className="h-plan-tier">Foundation</span>
                  <h3>Strategy Build</h3>
                  <ul>
                    <li>Initial profile diagnostic</li>
                    <li>School list architecture</li>
                    <li>Budget-fit planning</li>
                    <li>Strategy roadmap</li>
                  </ul>
                  <Link className="h-btn-outline" href="/contact">
                    Request Details
                  </Link>
                </article>
                <article className="h-plan-card h-plan-card--pop">
                  <div className="h-plan-badge">Most Popular</div>
                  <span className="h-plan-tier">Comprehensive</span>
                  <h3>Full Guidance</h3>
                  <ul>
                    <li>Everything in Foundation</li>
                    <li>Essay &amp; narrative direction</li>
                    <li>Application review cycles</li>
                    <li>Submission quality control</li>
                  </ul>
                  <Link className="h-btn-primary" href="/contact">
                    Book Consultation
                  </Link>
                </article>
                <article className="h-plan-card">
                  <span className="h-plan-tier">Intensive</span>
                  <h3>Premium Mentorship</h3>
                  <ul>
                    <li>Everything in Full Guidance</li>
                    <li>High-frequency advisor sessions</li>
                    <li>Advanced scholarship strategy</li>
                    <li>Interview prep &amp; final polish</li>
                  </ul>
                  <Link className="h-btn-outline" href="/contact">
                    Request Details
                  </Link>
                </article>
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
                <a className="h-btn-light" href="/neural-engine">
                  Launch the Engine
                  <span className="h-btn-arrow" aria-hidden="true">
                    &rarr;
                  </span>
                </a>
              </div>
            </section>
          </AnimatedSection>

          {/* ─── FAQ ─── */}
          <AnimatedSection>
            <section className="h-sect">
              <div className="h-sect-head">
                <span className="h-kicker">FAQ</span>
                <h2>Common questions, direct answers</h2>
                <svg className="h-accent h-accent--ring h-accent--br" viewBox="0 0 32 32" aria-hidden="true">
                  <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="1"/>
                </svg>
              </div>
              <div className="h-faq">
                <details className="h-faq-item">
                  <summary>
                    Do you support students applying outside the US?
                    <span className="h-faq-chevron" aria-hidden="true" />
                  </summary>
                  <p>
                    Yes. We support applications to the US, UK, Canada, Europe,
                    Singapore, Australia, and more. Cross-region strategies are one
                    of our strongest areas.
                  </p>
                </details>
                <details className="h-faq-item">
                  <summary>
                    When is the best time to start?
                    <span className="h-faq-chevron" aria-hidden="true" />
                  </summary>
                  <p>
                    Earlier is better. Starting in sophomore or junior year means
                    activities, rigor, and narrative can compound over time — but we
                    regularly work with seniors on tight timelines too.
                  </p>
                </details>
                <details className="h-faq-item">
                  <summary>
                    Is affordability factored into your recommendations?
                    <span className="h-faq-chevron" aria-hidden="true" />
                  </summary>
                  <p>
                    Always. Budget and aid constraints are built into strategy from
                    Day 1, not bolted on as an afterthought. We won&apos;t recommend
                    schools you can&apos;t realistically attend.
                  </p>
                </details>
                <details className="h-faq-item">
                  <summary>
                    What makes this different from other college counselors?
                    <span className="h-faq-chevron" aria-hidden="true" />
                  </summary>
                  <p>
                    We use a structured, milestone-based system — not vague pep
                    talks. Every engagement has clear deliverables, timelines, and
                    quality gates.
                  </p>
                </details>
              </div>
            </section>
          </AnimatedSection>

          {/* ─── FINAL CTA ─── */}
          <AnimatedSection>
            <section className="h-final">
              <div className="h-final-glow" aria-hidden="true" />
              <h2>Ready to build yours?</h2>
              <p>
                Share your profile, target majors, and budget range. We&apos;ll
                map the strongest path for your application cycle.
              </p>
              <Link className="h-btn-primary h-btn-lg" href="/contact">
                Book a Consultation
                <span className="h-btn-arrow" aria-hidden="true">
                  &rarr;
                </span>
              </Link>
            </section>
          </AnimatedSection>
        </main>
      </SmoothScrollProvider>

      {/* ─── FOOTER ─── */}
      <footer className="h-foot">
        <div className="h-foot-inner">
          <div className="h-foot-left">
            <span className="h-foot-brand">Admission Atlas</span>
            <span className="h-foot-tag">
              Strategic admissions counsel.
            </span>
          </div>
          <nav className="h-foot-links">
            <Link href="/team">Team</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/login">Log in</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
