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
      <div className="noise" />

      <header className="topbar">
        <Link className="brand" href="/">
          Admission Atlas
        </Link>
        <nav className="topnav">
          <a href="#services">Services</a>
          <a href="#approach">How It Works</a>
          <a href="#outcomes">Results</a>
          <Link href="/team">Team</Link>
          <Link href="/login" className="login-link">Log In</Link>
          <Link className="cta-nav" href="/contact">
            Book a Call
          </Link>
        </nav>
      </header>

      <main className="shell">
        {/* ─── HERO ─── */}
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Admissions strategy for ambitious families</p>
            <h1>Your University Application Deserves a Real&nbsp;Strategy</h1>
            <p className="lead">
              We build defensible admissions plans — targeting the right schools, in the right
              regions, at the right price — so every application is positioned to win.
            </p>
            <div className="actions">
              <Link className="btn-primary" href="/contact">
                Start Your Strategy Session &rarr;
              </Link>
              <a className="btn-ghost" href="#services">
                See How It Works
              </a>
            </div>
          </div>
          <aside className="hero-aside">
            <div className="stat-grid">
              <div className="stat-card">
                <span className="stat-number">4</span>
                <span className="stat-label">Phase Framework</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">1:1</span>
                <span className="stat-label">Advisor Feedback</span>
              </div>
              <div className="stat-card accent-card">
                <span className="stat-number">30+</span>
                <span className="stat-label">Countries Covered</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">100%</span>
                <span className="stat-label">Budget-Aware</span>
              </div>
            </div>
            <div className="hero-checklist">
              <h3>What a complete plan covers</h3>
              <ul>
                <li>Profile diagnostic &amp; admissions risk scan</li>
                <li>School list with reach / target / likely balance</li>
                <li>Narrative &amp; essays aligned to each program</li>
                <li>Execution timeline with quality checkpoints</li>
              </ul>
              <Link className="link-arrow" href="/results">
                View real outcomes &rarr;
              </Link>
            </div>
          </aside>
        </section>

        {/* ─── TRUST BAND ─── */}
        <div className="trust-band">
          <p>
            Rigorous. Transparent. Budget-first. We optimize strategy without overpromising
            outcomes.
          </p>
        </div>

        {/* ─── SERVICES ─── */}
        <section id="services" className="section">
          <header className="section-header">
            <p className="eyebrow">What We Do</p>
            <h2>End-to-end admissions strategy — not disconnected advice</h2>
            <p className="section-sub">
              Every engagement follows a structured system so nothing gets missed and every dollar of
              tuition exposure is intentional.
            </p>
          </header>
          <div className="card-grid cols-3">
            <article className="feature-card">
              <div className="card-icon">🏛</div>
              <h3>School List Architecture</h3>
              <p>
                A portfolio designed around profile strength, acceptance risk, and what you can
                actually afford.
              </p>
            </article>
            <article className="feature-card">
              <div className="card-icon">🎯</div>
              <h3>Major-Fit Positioning</h3>
              <p>
                Translate your coursework, projects, and activities into the signals departments
                actually evaluate.
              </p>
            </article>
            <article className="feature-card">
              <div className="card-icon">✍️</div>
              <h3>Narrative Strategy</h3>
              <p>
                Essays and short responses that communicate direction, depth, and genuine relevance —
                not platitudes.
              </p>
            </article>
            <article className="feature-card">
              <div className="card-icon">📋</div>
              <h3>Execution Management</h3>
              <p>
                Deadlines, drafts, recommendations, and polish — all running on a single, visible
                timeline.
              </p>
            </article>
            <article className="feature-card">
              <div className="card-icon">💰</div>
              <h3>Budget &amp; Aid Planning</h3>
              <p>
                Compare tuition exposure, aid probability, and scholarship odds before you lock your
                list.
              </p>
            </article>
            <article className="feature-card">
              <div className="card-icon">👥</div>
              <h3>Family Decision Support</h3>
              <p>
                Make trade-offs explicit so decisions stay grounded in goals, fit, and financial
                reality.
              </p>
            </article>
          </div>
        </section>

        {/* ─── APPROACH ─── */}
        <section id="approach" className="section">
          <header className="section-header">
            <p className="eyebrow">How It Works</p>
            <h2>A disciplined workflow from audit to final submission</h2>
          </header>
          <div className="timeline">
            <article className="step">
              <div className="step-num">01</div>
              <div className="step-body">
                <h3>Diagnostic Review</h3>
                <p>
                  We assess your academics, activities, goals, and constraints to define your
                  strategic baseline.
                </p>
              </div>
            </article>
            <article className="step">
              <div className="step-num">02</div>
              <div className="step-body">
                <h3>Portfolio Design</h3>
                <p>
                  Build the school list and application strategy across regions and competitiveness
                  tiers.
                </p>
              </div>
            </article>
            <article className="step">
              <div className="step-num">03</div>
              <div className="step-body">
                <h3>Narrative &amp; Materials</h3>
                <p>
                  Draft and refine your personal narrative, activities list, essays, and supplemental
                  responses.
                </p>
              </div>
            </article>
            <article className="step">
              <div className="step-num">04</div>
              <div className="step-body">
                <h3>Submission Control</h3>
                <p>
                  Pre-submit checks for coherence, fit signal, and quality — under deadline pressure.
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* ─── OUTCOMES ─── */}
        <section id="outcomes" className="section">
          <header className="section-header">
            <p className="eyebrow">The Difference Structure Makes</p>
            <h2>What actually improves when the process is rigorous</h2>
          </header>
          <div className="card-grid cols-2">
            <article className="outcome-card">
              <h3>Sharper School Lists</h3>
              <p>
                Move from top-heavy guesswork to balanced portfolios with realistic, high-value
                alternatives across regions.
              </p>
            </article>
            <article className="outcome-card">
              <h3>Stronger Major-Fit Signal</h3>
              <p>
                Applications show tighter alignment between coursework, projects, goals, and target
                program expectations.
              </p>
            </article>
            <article className="outcome-card">
              <h3>Cleaner Execution</h3>
              <p>
                Milestone-based workflows eliminate rushed drafts, missed deadlines, and avoidable
                submission errors.
              </p>
            </article>
            <article className="outcome-card">
              <h3>Higher Decision Confidence</h3>
              <p>
                Families choose with clearer trade-offs across selectivity, cost, location, and
                long-term outcomes.
              </p>
            </article>
          </div>
        </section>

        {/* ─── PRICING ─── */}
        <section className="section">
          <header className="section-header">
            <p className="eyebrow">Programs</p>
            <h2>Pick the support level that matches your timeline</h2>
          </header>
          <div className="card-grid cols-3 pricing-grid">
            <article className="plan-card">
              <p className="plan-tag">Foundation</p>
              <h3>Strategy Build</h3>
              <ul>
                <li>Initial profile diagnostic</li>
                <li>School list architecture</li>
                <li>Budget-fit planning</li>
                <li>Strategy roadmap</li>
              </ul>
              <Link className="btn-outline" href="/contact">
                Request Details
              </Link>
            </article>
            <article className="plan-card featured">
              <div className="popular-badge">Most Popular</div>
              <p className="plan-tag">Comprehensive</p>
              <h3>Full Guidance</h3>
              <ul>
                <li>Everything in Foundation</li>
                <li>Essay &amp; narrative direction</li>
                <li>Application review cycles</li>
                <li>Submission quality control</li>
              </ul>
              <Link className="btn-primary" href="/contact">
                Book Consultation
              </Link>
            </article>
            <article className="plan-card">
              <p className="plan-tag">Intensive</p>
              <h3>Premium Mentorship</h3>
              <ul>
                <li>Everything in Full Guidance</li>
                <li>High-frequency advisor sessions</li>
                <li>Advanced scholarship strategy</li>
                <li>Interview prep &amp; final polish</li>
              </ul>
              <Link className="btn-outline" href="/contact">
                Request Details
              </Link>
            </article>
          </div>
        </section>

        {/* ─── AI ENGINE CALLOUT ─── */}
        <section className="engine-callout">
          <div className="engine-inner">
            <p className="eyebrow">Free Tool</p>
            <h2>Try the Neural Match Engine</h2>
            <p>
              Input your profile, target school, and budget — our AI scores your fit and suggests
              alternatives worldwide. Instant, no sign-up required.
            </p>
            <a className="btn-primary" href="/neural-engine">
              Launch the Engine &rarr;
            </a>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="section">
          <header className="section-header">
            <p className="eyebrow">FAQ</p>
            <h2>Common questions, straight&nbsp;answers</h2>
          </header>
          <div className="faq-list">
            <details>
              <summary>Do you support students applying outside the US?</summary>
              <p>
                Yes. We support applications to the US, UK, Canada, Europe, Singapore, Australia, and
                more. Cross-region strategies are one of our strongest areas.
              </p>
            </details>
            <details>
              <summary>When is the best time to start?</summary>
              <p>
                Earlier is better. Starting in sophomore or junior year means activities, rigor, and
                narrative can compound over time — but we regularly work with seniors on tight
                timelines too.
              </p>
            </details>
            <details>
              <summary>Is affordability factored into your recommendations?</summary>
              <p>
                Always. Budget and aid constraints are built into strategy from Day 1, not bolted on
                as an afterthought. We won&#39;t recommend schools you can&#39;t realistically
                attend.
              </p>
            </details>
            <details>
              <summary>What makes this different from other college counselors?</summary>
              <p>
                We use a structured, milestone-based system — not vague pep talks. Every engagement
                has clear deliverables, timelines, and quality gates. Families know exactly
                what&#39;s happening and when.
              </p>
            </details>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="final-cta">
          <h2>Ready to build a strategy that actually holds up?</h2>
          <p>
            Share your profile, target majors, and budget range. We&#39;ll map the best path for
            your application cycle — no pressure, no fluff.
          </p>
          <Link className="btn-primary btn-lg" href="/contact">
            Book Your Free Consultation &rarr;
          </Link>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <span className="footer-brand">Admission Atlas</span>
          <span className="footer-tagline">
            Strategic admissions guidance for high-stakes decisions.
          </span>
        </div>
      </footer>
    </>
  );
}
