import type { Metadata } from 'next';
import Link from 'next/link';

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

      <main className="shell">
        {/* ─── HERO ─── */}
        <section className="h-hero">
          <div className="h-hero-orb h-hero-orb--1" aria-hidden="true" />
          <div className="h-hero-orb h-hero-orb--2" aria-hidden="true" />
          <span className="h-badge">Strategy for ambitious families</span>
          <h1>
            Your university application
            <br />
            deserves a <em>real</em>&nbsp;strategy
          </h1>
          <p className="h-hero-desc">
            We build defensible admissions plans — targeting the right schools,
            in the right regions, at the right price — so every application is
            positioned to win.
          </p>
          <div className="h-hero-actions">
            <Link className="h-btn-primary" href="/contact">
              Start Your Strategy Session
              <span className="h-btn-arrow" aria-hidden="true">
                &rarr;
              </span>
            </Link>
            <a className="h-btn-ghost" href="#services">
              See How It Works
            </a>
          </div>
        </section>

        {/* ─── METRICS ─── */}
        <section className="h-metrics">
          <div className="h-metric">
            <strong>4-Phase</strong>
            <span>Framework</span>
          </div>
          <div className="h-metric">
            <strong>1 : 1</strong>
            <span>Advisor Feedback</span>
          </div>
          <div className="h-metric">
            <strong>30+</strong>
            <span>Countries</span>
          </div>
          <div className="h-metric">
            <strong>100%</strong>
            <span>Budget-Aware</span>
          </div>
        </section>

        {/* ─── SERVICES ─── */}
        <section id="services" className="h-sect">
          <div className="h-sect-head">
            <span className="h-kicker">What We Do</span>
            <h2>
              End-to-end admissions strategy
              <br />
              — not disconnected&nbsp;advice
            </h2>
          </div>
          <p className="h-sect-sub">
            Every engagement follows a structured system so nothing gets missed
            and every dollar of tuition exposure is intentional.
          </p>

          {/* Bento grid — 2 wide + 4 narrow */}
          <div className="h-bento">
            <article className="h-bento-card h-bento-wide">
              <span className="h-bento-num">01</span>
              <h3>School List Architecture</h3>
              <p>
                A portfolio designed around profile strength, acceptance risk,
                and what you can actually afford — across regions and
                competitiveness tiers.
              </p>
            </article>
            <article className="h-bento-card h-bento-wide">
              <span className="h-bento-num">02</span>
              <h3>Major-Fit Positioning</h3>
              <p>
                Translate your coursework, projects, and activities into the
                signals departments actually evaluate — not guesswork.
              </p>
            </article>
            <article className="h-bento-card">
              <span className="h-bento-num">03</span>
              <h3>Narrative Strategy</h3>
              <p>
                Essays that communicate direction and depth — not platitudes.
              </p>
            </article>
            <article className="h-bento-card">
              <span className="h-bento-num">04</span>
              <h3>Execution Management</h3>
              <p>
                Deadlines, drafts, and polish on a single visible timeline.
              </p>
            </article>
            <article className="h-bento-card">
              <span className="h-bento-num">05</span>
              <h3>Budget &amp; Aid</h3>
              <p>
                Compare tuition, aid probability, and scholarship odds upfront.
              </p>
            </article>
            <article className="h-bento-card">
              <span className="h-bento-num">06</span>
              <h3>Family Decisions</h3>
              <p>
                Make trade-offs explicit so decisions stay grounded in reality.
              </p>
            </article>
          </div>
        </section>

        {/* ─── PROCESS (horizontal timeline) ─── */}
        <section id="process" className="h-sect">
          <div className="h-sect-head">
            <span className="h-kicker">How It Works</span>
            <h2>From diagnostic to final&nbsp;submission</h2>
          </div>
          <div className="h-timeline">
            <div className="h-timeline-track" aria-hidden="true" />
            <article className="h-tl-step">
              <div className="h-tl-dot" />
              <span className="h-tl-label">01</span>
              <h3>Diagnostic Review</h3>
              <p>
                Assess academics, activities, goals, and constraints to define
                your strategic baseline.
              </p>
            </article>
            <article className="h-tl-step">
              <div className="h-tl-dot" />
              <span className="h-tl-label">02</span>
              <h3>Portfolio Design</h3>
              <p>
                Build the school list and application strategy across regions and
                tiers.
              </p>
            </article>
            <article className="h-tl-step">
              <div className="h-tl-dot" />
              <span className="h-tl-label">03</span>
              <h3>Narrative &amp; Materials</h3>
              <p>
                Draft and refine your personal narrative, essays, and
                supplemental responses.
              </p>
            </article>
            <article className="h-tl-step">
              <div className="h-tl-dot" />
              <span className="h-tl-label">04</span>
              <h3>Submission Control</h3>
              <p>
                Pre-submit checks for coherence, fit signal, and quality under
                deadline pressure.
              </p>
            </article>
          </div>
        </section>

        {/* ─── OUTCOMES (alternating dark) ─── */}
        <section id="outcomes" className="h-dark-sect">
          <div className="h-dark-inner">
            <span className="h-kicker h-kicker--light">
              The Difference Structure Makes
            </span>
            <h2>What improves when the process is&nbsp;rigorous</h2>
            <div className="h-outcomes">
              <article className="h-outcome">
                <span className="h-outcome-icon" aria-hidden="true">
                  &#x25C7;
                </span>
                <h3>Sharper School Lists</h3>
                <p>
                  From top-heavy guesswork to balanced portfolios with realistic,
                  high-value alternatives across regions.
                </p>
              </article>
              <article className="h-outcome">
                <span className="h-outcome-icon" aria-hidden="true">
                  &#x25C7;
                </span>
                <h3>Stronger Major-Fit Signal</h3>
                <p>
                  Tighter alignment between coursework, projects, goals, and
                  target program expectations.
                </p>
              </article>
              <article className="h-outcome">
                <span className="h-outcome-icon" aria-hidden="true">
                  &#x25C7;
                </span>
                <h3>Cleaner Execution</h3>
                <p>
                  Milestone-based workflows eliminate rushed drafts, missed
                  deadlines, and avoidable errors.
                </p>
              </article>
              <article className="h-outcome">
                <span className="h-outcome-icon" aria-hidden="true">
                  &#x25C7;
                </span>
                <h3>Higher Decision Confidence</h3>
                <p>
                  Families choose with clearer trade-offs across selectivity,
                  cost, location, and long-term outcomes.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ─── PRICING ─── */}
        <section className="h-sect">
          <div className="h-sect-head">
            <span className="h-kicker">Programs</span>
            <h2>Pick the level that matches your&nbsp;timeline</h2>
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

        {/* ─── AI ENGINE CALLOUT ─── */}
        <section className="h-callout">
          <div className="h-callout-inner">
            <span className="h-kicker h-kicker--light">Free Tool</span>
            <h2>Try the Neural Match&nbsp;Engine</h2>
            <p>
              Input your profile, target school, and budget — our AI scores your
              fit and suggests alternatives worldwide. Instant, no sign-up
              required.
            </p>
            <a className="h-btn-light" href="/neural-engine">
              Launch the Engine
              <span className="h-btn-arrow" aria-hidden="true">
                &rarr;
              </span>
            </a>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="h-sect">
          <div className="h-sect-head">
            <span className="h-kicker">FAQ</span>
            <h2>Common questions, straight&nbsp;answers</h2>
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

        {/* ─── FINAL CTA ─── */}
        <section className="h-final">
          <div className="h-final-glow" aria-hidden="true" />
          <h2>
            Ready to build a strategy
            <br />
            that actually holds&nbsp;up?
          </h2>
          <p>
            Share your profile, target majors, and budget range. We&apos;ll map
            the best path for your application cycle — no pressure, no fluff.
          </p>
          <Link className="h-btn-primary h-btn-lg" href="/contact">
            Book Your Free Consultation
            <span className="h-btn-arrow" aria-hidden="true">
              &rarr;
            </span>
          </Link>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="h-foot">
        <div className="h-foot-inner">
          <div className="h-foot-left">
            <span className="h-foot-brand">Admission Atlas</span>
            <span className="h-foot-tag">
              Strategic admissions guidance for high-stakes decisions.
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
