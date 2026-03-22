import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { CaseStudyCard } from '../_components/case-study-card';
import { CASE_STUDIES, BEFORE_AFTER } from '@/lib/landing-data';

export const metadata: Metadata = {
  title: 'SAJU Results | Student Outcomes and Case Stories',
  description:
    'See how students improve their admissions position with SAJU — case studies, before/after transformations, and measurable outcomes.',
};

export default function ResultsPage() {
  return (
    <main className="page">
      {/* ─── HERO (full-width) ─── */}
      <section className="results-hero">
        <span className="eyebrow">Outcomes</span>
        <h1>How Students Improve Their Admissions Position with SAJU</h1>
        <p className="lead">
          Our approach focuses on measurable improvements: stronger school list
          quality, clearer major positioning, tighter execution, and better
          budget-fit outcomes.
        </p>
        <div className="btn-row">
          <Link className="btn-primary" href="/contact">
            Discuss Your Profile
          </Link>
          <Link className="btn-ghost" href="/neural-engine">
            Run Neural Engine
          </Link>
        </div>
      </section>

      {/* ─── CASE STUDIES ─── */}
      <section className="section">
        <div className="section-head">
          <span className="eyebrow">Case Stories</span>
          <h2>Illustrative Student Journeys</h2>
        </div>
        <div className="results-case-grid">
          {CASE_STUDIES.map((study) => (
            <CaseStudyCard key={study.name} study={study} />
          ))}
        </div>
      </section>

      {/* ─── BEFORE / AFTER ─── */}
      <section className="section">
        <div className="section-head">
          <span className="eyebrow">Before &amp; After</span>
          <h2>Transformation Pattern</h2>
        </div>
        <div className="results-ba-grid">
          {BEFORE_AFTER.map((item, i) => (
            <article key={i} className="results-ba-card">
              <div className="results-ba-side results-ba-before">
                <span className="results-ba-label">Before</span>
                <p>{item.before}</p>
              </div>
              <div className="results-ba-arrow" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </div>
              <div className="results-ba-side results-ba-after">
                <span className="results-ba-label">After</span>
                <p>{item.after}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="results-ba-thread">
          <h3>What they all had in common (and how we fixed it):</h3>
          <ol>
            <li>Unclear academic direction</li>
            <li>Weak profile</li>
            <li>Confusion from scattered info</li>
          </ol>
        </div>
      </section>

      {/* ─── GET YOUR OWN BASELINE ─── */}
      <section className="section">
        <div className="section-head">
          <span className="eyebrow">Your Turn</span>
          <h2>Get Your Own Baseline First</h2>
        </div>
        <div className="results-steps">
          <article className="results-step">
            <span className="results-step-num">1</span>
            <div>
              <h3>Run Neural Engine</h3>
              <p>Input your profile, constraints, and budget.</p>
            </div>
          </article>
          <article className="results-step">
            <span className="results-step-num">2</span>
            <div>
              <h3>Schedule Initial Consultation</h3>
              <p>Review result gaps and identify where your profile underperforms relative to targets.</p>
            </div>
          </article>
          <article className="results-step">
            <span className="results-step-num">3</span>
            <div>
              <h3>Begin Your Application Journey</h3>
              <p>Build a structured action plan with counselor guidance to close key gaps before deadlines.</p>
            </div>
          </article>
        </div>
        <div className="results-steps-cta">
          <Link className="btn-primary" href="/neural-engine">
            Get Started
          </Link>
        </div>
      </section>
    </main>
  );
}
