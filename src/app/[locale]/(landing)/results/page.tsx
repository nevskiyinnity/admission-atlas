import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admission Atlas Results | Student Outcomes and Case Stories',
  description:
    'See how students improve their admissions position with Admission Atlas — stronger school lists, clearer positioning, and better outcomes.',
};

export default function ResultsPage() {
  return (
    <>
      <main className="page">
        <section className="hero-wrap">
          <article className="hero">
            <p className="kicker">Outcomes</p>
            <h1>How Students Improve Their Admissions Position with Admission Atlas</h1>
            <p className="lead">
              Our approach focuses on measurable improvements: stronger school list quality, clearer
              major positioning, tighter execution, and better budget-fit outcomes.
            </p>
            <div className="btn-row">
              <a className="btn-primary" href="/neural-engine">
                Run Neural Engine
              </a>
              <Link className="btn-ghost" href="/contact">
                Discuss Your Profile
              </Link>
            </div>
          </article>
          <aside className="hero-side">
            <h3>Improvement Areas We Track</h3>
            <div className="metric-grid">
              <article className="stat">
                <strong>List Fit</strong>
                <span>reach/target/likely quality</span>
              </article>
              <article className="stat">
                <strong>Narrative</strong>
                <span>coherence and specificity</span>
              </article>
              <article className="stat">
                <strong>Budget</strong>
                <span>cost-aid viability</span>
              </article>
            </div>
          </aside>
        </section>

        <section className="section">
          <div className="section-head">
            <p className="kicker">Case Stories</p>
            <h2>Representative Student Journeys</h2>
          </div>
          <div className="story-grid">
            <article className="story">
              <h3>STEM Candidate with Strong Grades, Weak Narrative</h3>
              <p>
                <strong>Starting point:</strong> Excellent scores and activities but generic essay
                framing.
              </p>
              <p>
                <strong>What changed:</strong> Reworked project descriptions around impact metrics
                and major-relevant curiosity.
              </p>
              <p>
                <strong>Result:</strong> Clearer profile signal and stronger shortlist alternatives
                with scholarships in range.
              </p>
            </article>
            <article className="story">
              <h3>Business Applicant with Budget Constraints</h3>
              <p>
                <strong>Starting point:</strong> High ambition but list skewed toward expensive reach
                schools.
              </p>
              <p>
                <strong>What changed:</strong> Budget-first list redesign, aid strategy, and
                outcomes-focused alternatives.
              </p>
              <p>
                <strong>Result:</strong> More balanced applications and better affordability
                confidence at decision time.
              </p>
            </article>
            <article className="story">
              <h3>International Applicant with Mixed Exam Context</h3>
              <p>
                <strong>Starting point:</strong> Strong potential, unclear mapping from national exam
                system.
              </p>
              <p>
                <strong>What changed:</strong> Standardized profile normalization and globally
                diversified alternatives.
              </p>
              <p>
                <strong>Result:</strong> Better-fit list across regions with stronger admission
                feasibility.
              </p>
            </article>
            <article className="story">
              <h3>Late-Stage Applicant with Deadline Pressure</h3>
              <p>
                <strong>Starting point:</strong> Good profile but unstructured timelines and
                inconsistent drafts.
              </p>
              <p>
                <strong>What changed:</strong> Execution sprint plan with staged review checkpoints.
              </p>
              <p>
                <strong>Result:</strong> Cleaner submission quality and reduced avoidable application
                errors.
              </p>
            </article>
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <p className="kicker">Before and After</p>
            <h2>Common Transformation Pattern</h2>
          </div>
          <div className="card-grid">
            <article className="card">
              <h3>Before</h3>
              <p>
                Overly top-heavy school list, weak alternatives, and no clear budget guardrails.
              </p>
            </article>
            <article className="card">
              <h3>After</h3>
              <p>
                Balanced list architecture with practical alternatives and explicit affordability
                constraints.
              </p>
            </article>
            <article className="card">
              <h3>Before</h3>
              <p>Activities read as a resume dump rather than a coherent story with direction.</p>
            </article>
            <article className="card">
              <h3>After</h3>
              <p>
                Narrative alignment between academics, projects, goals, and intended major.
              </p>
            </article>
            <article className="card">
              <h3>Before</h3>
              <p>Reactive workflow with missed opportunities and inconsistent draft quality.</p>
            </article>
            <article className="card">
              <h3>After</h3>
              <p>Milestone-driven execution process and predictable review cadence.</p>
            </article>
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <p className="kicker">How to Use This</p>
            <h2>Get Your Own Baseline First</h2>
            <p>
              Run Admission Atlas Neural Engine to establish your current match % and alternatives,
              then refine strategy with counseling support.
            </p>
          </div>
          <div className="timeline">
            <article className="timeline-item">
              <span>1</span>
              <div>
                <h3>Run Neural Engine</h3>
                <p>Input your profile, constraints, and budget.</p>
              </div>
            </article>
            <article className="timeline-item">
              <span>2</span>
              <div>
                <h3>Review Result Gaps</h3>
                <p>Identify where your profile underperforms relative to targets.</p>
              </div>
            </article>
            <article className="timeline-item">
              <span>3</span>
              <div>
                <h3>Build Action Plan</h3>
                <p>Use counselor guidance to close key gaps before deadlines.</p>
              </div>
            </article>
          </div>
          <div className="notice">
            Results vary by profile, competitiveness, timing, and execution quality. Admission
            outcomes are never guaranteed.
          </div>
        </section>

        <section className="cta">
          <h2>See Your Own Match and Alternatives</h2>
          <p>
            Use the Neural Engine today, then schedule a strategy review if you want a full
            admissions plan.
          </p>
          <a className="btn-primary" href="/neural-engine">
            Launch Neural Engine
          </a>
        </section>
      </main>
    </>
  );
}
