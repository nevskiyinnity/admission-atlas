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
      <div className="h-grain" />

      <header className="h-nav">
        <div className="h-nav-inner">
          <Link className="h-brand" href="/">
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
          <span className="h-badge">Strategy for ambitious families</span>
          <h1>
            Your university application
            <br />
            deserves a real&nbsp;strategy
          </h1>
          <p className="h-hero-desc">
            We build defensible admissions plans — targeting the right schools, in the right
            regions, at the right price — so every application is positioned to win.
          </p>
          <div className="h-hero-actions">
            <Link className="h-btn-primary" href="/contact">
              Start Your Strategy Session <span aria-hidden="true">&rarr;</span>
            </Link>
            <a className="h-btn-ghost" href="#services">
              See How It Works
            </a>
          </div>
        </section>

        {/* ─── METRICS ─── */}
        <section className="h-stats">
          <div className="h-stat">
            <strong>4-Phase</strong>
            <span>Framework</span>
          </div>
          <div className="h-stat-sep" />
          <div className="h-stat">
            <strong>1 : 1</strong>
            <span>Advisor Feedback</span>
          </div>
          <div className="h-stat-sep" />
          <div className="h-stat">
            <strong>30+</strong>
            <span>Countries</span>
          </div>
          <div className="h-stat-sep" />
          <div className="h-stat">
            <strong>100%</strong>
            <span>Budget-Aware</span>
          </div>
        </section>

        <hr className="h-rule" />

        {/* ─── SERVICES ─── */}
        <section id="services" className="h-sect">
          <span className="h-kicker">What We Do</span>
          <h2>
            End-to-end admissions strategy
            <br />
            — not disconnected advice
          </h2>
          <p className="h-sect-sub">
            Every engagement follows a structured system so nothing gets missed and every dollar
            of tuition exposure is intentional.
          </p>
          <div className="h-grid h-grid-3">
            <article className="h-card">
              <h3>School List Architecture</h3>
              <p>
                A portfolio designed around profile strength, acceptance risk, and what you can
                actually afford.
              </p>
            </article>
            <article className="h-card">
              <h3>Major-Fit Positioning</h3>
              <p>
                Translate your coursework, projects, and activities into the signals departments
                actually evaluate.
              </p>
            </article>
            <article className="h-card">
              <h3>Narrative Strategy</h3>
              <p>
                Essays and short responses that communicate direction, depth, and genuine
                relevance — not platitudes.
              </p>
            </article>
            <article className="h-card">
              <h3>Execution Management</h3>
              <p>
                Deadlines, drafts, recommendations, and polish — all running on a single, visible
                timeline.
              </p>
            </article>
            <article className="h-card">
              <h3>Budget &amp; Aid Planning</h3>
              <p>
                Compare tuition exposure, aid probability, and scholarship odds before you lock
                your list.
              </p>
            </article>
            <article className="h-card">
              <h3>Family Decision Support</h3>
              <p>
                Make trade-offs explicit so decisions stay grounded in goals, fit, and financial
                reality.
              </p>
            </article>
          </div>
        </section>

        {/* ─── PROCESS ─── */}
        <section id="process" className="h-sect">
          <span className="h-kicker">How It Works</span>
          <h2>From diagnostic to final submission</h2>
          <div className="h-steps">
            <article className="h-step">
              <span className="h-step-n">01</span>
              <div>
                <h3>Diagnostic Review</h3>
                <p>
                  We assess your academics, activities, goals, and constraints to define your
                  strategic baseline.
                </p>
              </div>
            </article>
            <article className="h-step">
              <span className="h-step-n">02</span>
              <div>
                <h3>Portfolio Design</h3>
                <p>
                  Build the school list and application strategy across regions and
                  competitiveness tiers.
                </p>
              </div>
            </article>
            <article className="h-step">
              <span className="h-step-n">03</span>
              <div>
                <h3>Narrative &amp; Materials</h3>
                <p>
                  Draft and refine your personal narrative, activities list, essays, and
                  supplemental responses.
                </p>
              </div>
            </article>
            <article className="h-step">
              <span className="h-step-n">04</span>
              <div>
                <h3>Submission Control</h3>
                <p>
                  Pre-submit checks for coherence, fit signal, and quality — under deadline
                  pressure.
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* ─── OUTCOMES ─── */}
        <section id="outcomes" className="h-sect">
          <span className="h-kicker">The Difference Structure Makes</span>
          <h2>What improves when the process is rigorous</h2>
          <div className="h-grid h-grid-2">
            <article className="h-card h-card-accent">
              <h3>Sharper School Lists</h3>
              <p>
                Move from top-heavy guesswork to balanced portfolios with realistic, high-value
                alternatives across regions.
              </p>
            </article>
            <article className="h-card h-card-accent">
              <h3>Stronger Major-Fit Signal</h3>
              <p>
                Applications show tighter alignment between coursework, projects, goals, and
                target program expectations.
              </p>
            </article>
            <article className="h-card h-card-accent">
              <h3>Cleaner Execution</h3>
              <p>
                Milestone-based workflows eliminate rushed drafts, missed deadlines, and avoidable
                submission errors.
              </p>
            </article>
            <article className="h-card h-card-accent">
              <h3>Higher Decision Confidence</h3>
              <p>
                Families choose with clearer trade-offs across selectivity, cost, location, and
                long-term outcomes.
              </p>
            </article>
          </div>
        </section>

        {/* ─── PRICING ─── */}
        <section className="h-sect">
          <span className="h-kicker">Programs</span>
          <h2>Pick the level that matches your timeline</h2>
          <div className="h-pricing">
            <article className="h-plan">
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
            <article className="h-plan h-plan-pop">
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
            <article className="h-plan">
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
            <span className="h-kicker h-kicker-light">Free Tool</span>
            <h2>Try the Neural Match Engine</h2>
            <p>
              Input your profile, target school, and budget — our AI scores your fit and suggests
              alternatives worldwide. Instant, no sign-up required.
            </p>
            <a className="h-btn-light" href="/neural-engine">
              Launch the Engine <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="h-sect">
          <span className="h-kicker">FAQ</span>
          <h2>Common questions, straight&nbsp;answers</h2>
          <div className="h-faq">
            <details className="h-faq-item">
              <summary>
                Do you support students applying outside the US?
                <span className="h-faq-icon" />
              </summary>
              <p>
                Yes. We support applications to the US, UK, Canada, Europe, Singapore, Australia,
                and more. Cross-region strategies are one of our strongest areas.
              </p>
            </details>
            <details className="h-faq-item">
              <summary>
                When is the best time to start?
                <span className="h-faq-icon" />
              </summary>
              <p>
                Earlier is better. Starting in sophomore or junior year means activities, rigor,
                and narrative can compound over time — but we regularly work with seniors on tight
                timelines too.
              </p>
            </details>
            <details className="h-faq-item">
              <summary>
                Is affordability factored into your recommendations?
                <span className="h-faq-icon" />
              </summary>
              <p>
                Always. Budget and aid constraints are built into strategy from Day 1, not bolted
                on as an afterthought. We won&apos;t recommend schools you can&apos;t
                realistically attend.
              </p>
            </details>
            <details className="h-faq-item">
              <summary>
                What makes this different from other college counselors?
                <span className="h-faq-icon" />
              </summary>
              <p>
                We use a structured, milestone-based system — not vague pep talks. Every
                engagement has clear deliverables, timelines, and quality gates.
              </p>
            </details>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="h-final">
          <h2>
            Ready to build a strategy
            <br />
            that actually holds up?
          </h2>
          <p>
            Share your profile, target majors, and budget range. We&apos;ll map the best path for
            your application cycle — no pressure, no fluff.
          </p>
          <Link className="h-btn-primary h-btn-lg" href="/contact">
            Book Your Free Consultation <span aria-hidden="true">&rarr;</span>
          </Link>
        </section>
      </main>

      <footer className="h-foot">
        <div className="h-foot-inner">
          <span className="h-foot-brand">Admission Atlas</span>
          <span className="h-foot-tag">
            Strategic admissions guidance for high-stakes decisions.
          </span>
        </div>
      </footer>
    </>
  );
}
