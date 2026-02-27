import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admission Atlas Team | Counselors, Strategists, and Advisors',
  description:
    'Meet the admissions strategists, essay specialists, and student-success advisors behind Admission Atlas.',
};

export default function TeamPage() {
  return (
    <>
      <main className="page">
        {/* ─── HERO ─── */}
        <section className="hero-banner">
          <p className="eyebrow">Our Team</p>
          <h1>The People Behind Your Admissions&nbsp;Strategy</h1>
          <p className="hero-lead">
            Admission Atlas is built by admissions strategists, essay specialists, data analysts, and
            student-success advisors who combine practical counseling with structured
            decision-making.
          </p>
          <div className="hero-actions">
            <Link className="btn-primary" href="/contact">
              Book a Team Consultation &rarr;
            </Link>
            <Link className="btn-ghost" href="/results">
              View Student Outcomes
            </Link>
          </div>
        </section>

        {/* ─── DIFFERENTIATORS ─── */}
        <section className="diff-strip">
          <div className="diff-item">
            <span className="diff-icon">🌍</span>
            <div>
              <strong>Cross-System Expertise</strong>
              <p>Global admissions pathways across US, UK, EU, Canada, and APAC.</p>
            </div>
          </div>
          <div className="diff-item">
            <span className="diff-icon">🎯</span>
            <div>
              <strong>Tactical Execution</strong>
              <p>Actionable strategy, not generic motivational advice.</p>
            </div>
          </div>
          <div className="diff-item">
            <span className="diff-icon">💰</span>
            <div>
              <strong>Budget-First Approach</strong>
              <p>Scholarship and aid planning integrated from day one.</p>
            </div>
          </div>
          <div className="diff-item">
            <span className="diff-icon">✓</span>
            <div>
              <strong>Clear Accountability</strong>
              <p>Milestones, reviews, and quality gates at every phase.</p>
            </div>
          </div>
        </section>

        {/* ─── LEADERSHIP ─── */}
        <section className="section">
          <header className="section-header">
            <p className="eyebrow">Leadership</p>
            <h2>Meet the people driving your strategy</h2>
          </header>
          <div className="lead-grid">
            <article className="lead-card featured-lead">
              <div className="lead-meta">
                <div className="avatar">MC</div>
                <div>
                  <h3>Dr. Maya Chen</h3>
                  <p className="role-tag">Director of Admissions Strategy</p>
                </div>
              </div>
              <p>
                Leads school list architecture and admissions positioning across US and Canada
                pathways. Maya has guided 200+ students through competitive application cycles at
                top-30 universities.
              </p>
              <div className="expertise-row">
                <span className="tag">List Engineering</span>
                <span className="tag">STEM Strategy</span>
                <span className="tag">US &amp; Canada</span>
              </div>
            </article>
            <article className="lead-card featured-lead">
              <div className="lead-meta">
                <div className="avatar">AP</div>
                <div>
                  <h3>Arjun Patel</h3>
                  <p className="role-tag">Essay &amp; Narrative Lead</p>
                </div>
              </div>
              <p>
                Transforms student achievements into coherent, high-signal application narratives.
                Former writing instructor at Columbia University with deep expertise in personal
                statement strategy.
              </p>
              <div className="expertise-row">
                <span className="tag">Essays</span>
                <span className="tag">Story Design</span>
                <span className="tag">Supplements</span>
              </div>
            </article>
          </div>
        </section>

        {/* ─── SPECIALIST TEAM ─── */}
        <section className="section">
          <header className="section-header">
            <p className="eyebrow">Specialist Team</p>
            <h2>Depth across every dimension of admissions</h2>
          </header>
          <div className="specialist-grid">
            <article className="specialist-card">
              <div className="spec-header">
                <div className="avatar sm">SM</div>
                <div>
                  <h3>Sofia Martinez</h3>
                  <p className="role-tag">Budget &amp; Aid Advisor</p>
                </div>
              </div>
              <p>
                Builds aid-first recommendations and affordability plans across scholarship and grant
                options for families with specific cost constraints.
              </p>
              <div className="expertise-row">
                <span className="tag">Scholarships</span>
                <span className="tag">Budget Planning</span>
              </div>
            </article>
            <article className="specialist-card">
              <div className="spec-header">
                <div className="avatar sm">LN</div>
                <div>
                  <h3>Leo Nakamura</h3>
                  <p className="role-tag">Global Admissions Specialist</p>
                </div>
              </div>
              <p>
                Supports UK, Europe, and APAC applications with country-specific admissions
                constraints, including UCAS, IB, and A-Level pathways.
              </p>
              <div className="expertise-row">
                <span className="tag">UK / Europe</span>
                <span className="tag">APAC</span>
              </div>
            </article>
            <article className="specialist-card">
              <div className="spec-header">
                <div className="avatar sm">NO</div>
                <div>
                  <h3>Nina Okafor</h3>
                  <p className="role-tag">Student Success Coach</p>
                </div>
              </div>
              <p>
                Manages planning cadence, deadline discipline, and quality control through every
                phase of the submission cycle.
              </p>
              <div className="expertise-row">
                <span className="tag">Execution</span>
                <span className="tag">Timeline Ops</span>
              </div>
            </article>
            <article className="specialist-card">
              <div className="spec-header">
                <div className="avatar sm">DR</div>
                <div>
                  <h3>Daniel Reed</h3>
                  <p className="role-tag">Neural Engine Product Lead</p>
                </div>
              </div>
              <p>
                Ensures model outputs are usable, practical, and directly tied to admissions actions
                — driving the AI-powered match engine.
              </p>
              <div className="expertise-row">
                <span className="tag">AI Workflows</span>
                <span className="tag">Decision Support</span>
              </div>
            </article>
          </div>
        </section>

        {/* ─── PRINCIPLES ─── */}
        <section className="section">
          <header className="section-header">
            <p className="eyebrow">How We Work</p>
            <h2>Operating principles that shape every engagement</h2>
          </header>
          <div className="principles-list">
            <div className="principle">
              <div className="principle-num">01</div>
              <div className="principle-body">
                <h3>Clarity First</h3>
                <p>
                  Every recommendation includes explicit rationale and trade-offs so decisions are
                  understandable and defensible. We don&#39;t hide behind jargon.
                </p>
              </div>
            </div>
            <div className="principle">
              <div className="principle-num">02</div>
              <div className="principle-body">
                <h3>Evidence Over Guesswork</h3>
                <p>
                  Strategy is anchored in profile evidence, admissions constraints, and realistic
                  execution capability — not aspirational thinking.
                </p>
              </div>
            </div>
            <div className="principle">
              <div className="principle-num">03</div>
              <div className="principle-body">
                <h3>Budget Integrity</h3>
                <p>
                  Cost and aid constraints are part of list design from the beginning, not a
                  late-stage filter that narrows options after emotional attachment.
                </p>
              </div>
            </div>
            <div className="principle">
              <div className="principle-num">04</div>
              <div className="principle-body">
                <h3>Execution Discipline</h3>
                <p>
                  Deadlines, document quality, and review loops are managed as rigorously as strategy
                  design. Nothing ships without a quality check.
                </p>
              </div>
            </div>
            <div className="principle">
              <div className="principle-num">05</div>
              <div className="principle-body">
                <h3>Global Perspective</h3>
                <p>
                  We help students evaluate high-value options outside familiar geographies when fit,
                  cost, or outcomes are stronger elsewhere.
                </p>
              </div>
            </div>
            <div className="principle">
              <div className="principle-num">06</div>
              <div className="principle-body">
                <h3>Student Ownership</h3>
                <p>
                  Students are coached to make informed decisions and present authentic strengths —
                  not fabricated profiles. The application should sound like them.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── LOCATIONS ─── */}
        <section className="section">
          <header className="section-header">
            <p className="eyebrow">Global Reach</p>
            <h2>Where we support students</h2>
          </header>
          <div className="location-row">
            <article className="location-card">
              <span className="location-flag">🇺🇸</span>
              <h3>North America</h3>
              <p>
                Virtual counseling with timezone-friendly review blocks for US and Canada students
                across all time zones.
              </p>
            </article>
            <article className="location-card">
              <span className="location-flag">🇬🇧</span>
              <h3>Europe &amp; UK</h3>
              <p>
                Country-specific guidance for UCAS, EU pathways, and cross-border applications to top
                European institutions.
              </p>
            </article>
            <article className="location-card">
              <span className="location-flag">🇸🇬</span>
              <h3>Asia-Pacific</h3>
              <p>
                Support for IB, A Levels, and regional qualification pathways across Singapore,
                Australia, Hong Kong, and more.
              </p>
            </article>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="final-cta">
          <h2>Meet the team through a strategy session</h2>
          <p>
            Share your profile, target schools, and constraints. We&#39;ll recommend an actionable
            next-step plan — no commitment required.
          </p>
          <Link className="btn-primary btn-lg" href="/contact">
            Book Your Consultation &rarr;
          </Link>
        </section>
      </main>
    </>
  );
}
