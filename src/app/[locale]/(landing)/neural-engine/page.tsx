'use client';

import { useState, useCallback } from 'react';
import type { FormEvent } from 'react';

/* ── Types mirroring the API response ── */

interface CategoryScore {
  label: string;
  score: number;
}

interface Alternative {
  name: string;
  country: string;
  matchPercent: number;
  why: string;
}

interface AnalysisResult {
  institution: string;
  userTyped?: string;
  targetMatchPercent: number;
  summary: string;
  strengths: string[];
  concerns: string[];
  nextSteps: string[];
  categoryScores: CategoryScore[];
  alternatives: Alternative[];
  logs: string[];
  mock?: boolean;
  risk?: { label: 'safe' | 'balanced' | 'high-risk'; message: string };
  expectation?: { case: 'below' | 'match' | 'above'; message: string };
  disclaimer?: string;
  differentiation?: 'low' | 'medium' | 'high';
  academicBand?: 'low' | 'medium' | 'high';
  targetTier?: 'top10' | 'top30' | 'top50' | 'broader';
  studentTier?: 'top10' | 'top30' | 'top50' | 'broader';
}

const RISK_CLASS: Record<'safe' | 'balanced' | 'high-risk', string> = {
  'safe': 'ne-risk-safe',
  'balanced': 'ne-risk-balanced',
  'high-risk': 'ne-risk-high',
};

const RISK_TITLE: Record<'safe' | 'balanced' | 'high-risk', string> = {
  'safe': 'Safe option',
  'balanced': 'Balanced option',
  'high-risk': 'High-risk option',
};

/* ── Mock fill data ── */

const MOCK_FILL = {
  name: 'Jordan Lee',
  residency: 'international',
  university: 'University of Michigan',
  major: 'Computer Science',
  preferredRegions: 'USA, UK, Canada',
  gpa: '3.82',
  sat: 'SAT 1490',
  internationalExams: 'AP Calc BC 5, AP Physics C 5',
  otherExams: '',
  coursework: 'AP Calculus BC, AP Physics C, AP Computer Science A, Dual Enrollment Linear Algebra',
  activities: 'Founder and president of coding club; robotics software lead; peer tutoring 200+ hours',
  awards: 'State robotics finalist, National Merit Commended',
  question1: 'Project-based classes with close professor access and collaborative labs',
  question2: 'Built a campus navigation app used by 300 students',
  question3: 'Mid-size urban campus with strong internship pipeline',
  question4: 'Cost matters most; open to honors programs with scholarships',
  question5: 'Product management in health tech, then graduate school',
  question6: 'USD 25,000-40,000 per year',
  question7: 'Need merit scholarship of at least 30%, open to work-study',
  question8: 'Mentorship, career services, international student advising',
  question9: 'Startup incubators, debate, research labs, running club',
};

/* ── Helper: score color class ── */

function scoreColorClass(score: number): string {
  if (score >= 80) return 'ne-score-high';
  if (score >= 60) return 'ne-score-mid';
  return 'ne-score-low';
}

/* ── Page Component ── */

export default function NeuralEnginePage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    setLogs(['Initializing analysis...']);

    const fd = new FormData(e.currentTarget);
    const body: Record<string, string> = {};
    fd.forEach((value, key) => {
      body[key] = value.toString();
    });

    // Simulate log entries while waiting
    const logInterval = setInterval(() => {
      setLogs((prev) => {
        const messages = [
          'Ingesting applicant profile and narrative responses...',
          'Normalizing academic metrics across grading systems...',
          'Evaluating target institution selectivity...',
          'Scoring category fit dimensions...',
          'Comparing preference signals with campus characteristics...',
          'Building ranked worldwide university shortlist...',
          'Generating final match report...',
        ];
        const next = messages[prev.length - 1];
        if (next) return [...prev, next];
        return prev;
      });
    }, 1200);

    try {
      const res = await fetch('/api/neural-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      clearInterval(logInterval);

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      const data: AnalysisResult = await res.json();
      if (data.logs?.length) {
        setLogs(data.logs);
      }

      // Brief pause so the user sees the final log state
      await new Promise((r) => setTimeout(r, 600));
      setResult(data);
    } catch (err) {
      clearInterval(logInterval);
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMockFill = useCallback(() => {
    const form = document.getElementById('ne-form') as HTMLFormElement | null;
    if (!form) return;
    for (const [key, value] of Object.entries(MOCK_FILL)) {
      const el = form.elements.namedItem(key) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
      if (el) el.value = value;
    }
  }, []);

  return (
    <main className="ne-shell">
      {/* ── Hero ── */}
      <header className="ne-hero">
        <p className="ne-kicker">SAJU Admissions Intelligence</p>
        <h1 className="ne-title">Neural Match Engine</h1>
        <p className="ne-subtitle">
          Complete your profile and counseling questionnaire. Our AI engine generates your
          target match score and suggests alternative universities worldwide.
        </p>
        <button type="button" className="ne-btn-secondary" onClick={handleMockFill}>
          Fill Sample Answers
        </button>
      </header>

      {/* ── Form ── */}
      <form id="ne-form" className="ne-form" onSubmit={handleSubmit}>
        {/* Applicant Snapshot */}
        <section className="ne-card">
          <h2 className="ne-card-title">Applicant Snapshot</h2>
          <p className="ne-card-subtitle">Who you are and where you want to apply.</p>
          <div className="ne-grid">
            <label className="ne-label">
              Full Name
              <input type="text" name="name" placeholder="Jordan Lee" required className="ne-input" />
            </label>
            <label className="ne-label">
              Residency Status
              <select name="residency" className="ne-input">
                <option value="domestic">Domestic (In-State)</option>
                <option value="out_of_state">Domestic (Out-of-State)</option>
                <option value="international">International</option>
              </select>
            </label>
            <label className="ne-label">
              Target University
              <input type="text" name="university" placeholder="University of Michigan" required className="ne-input" />
            </label>
            <label className="ne-label">
              Intended Major
              <input type="text" name="major" placeholder="Computer Science" required className="ne-input" />
            </label>
            <label className="ne-label ne-full">
              Preferred Countries / Regions (Optional)
              <input type="text" name="preferredRegions" placeholder="e.g., USA, UK, Canada, Singapore" className="ne-input" />
            </label>
          </div>
        </section>

        {/* Academic Readiness */}
        <section className="ne-card">
          <h2 className="ne-card-title">Academic Readiness</h2>
          <p className="ne-card-subtitle">Supports GPA, SAT/ACT, A Levels, IB, and other exam systems.</p>
          <div className="ne-grid">
            <label className="ne-label">
              GPA (Optional, 4.0 scale)
              <input type="number" name="gpa" step="0.01" min="0" max="4.0" placeholder="3.82" className="ne-input" />
            </label>
            <label className="ne-label">
              SAT / ACT / Other Standardized Tests
              <input type="text" name="sat" placeholder="e.g., SAT 1490, ACT 33" className="ne-input" />
            </label>
            <label className="ne-label ne-full">
              A Levels / IB / AP / National Qualifications
              <textarea name="internationalExams" placeholder="e.g., A*AA in A Levels, IB 40/45 (HL Math 7), AP Calc BC 5" className="ne-input ne-textarea" />
            </label>
            <label className="ne-label ne-full">
              Other Exam Systems (Optional)
              <textarea name="otherExams" placeholder="e.g., Gaokao, JEE, Abitur, Leaving Cert" className="ne-input ne-textarea" />
            </label>
            <label className="ne-label ne-full">
              Advanced Coursework
              <textarea name="coursework" placeholder="AP Calculus BC, AP Physics C, Dual Enrollment Linear Algebra" className="ne-input ne-textarea" />
            </label>
          </div>
        </section>

        {/* Activities & Distinction */}
        <section className="ne-card">
          <h2 className="ne-card-title">Activities &amp; Distinction</h2>
          <p className="ne-card-subtitle">Impact, leadership, and outcomes outside class.</p>
          <div className="ne-grid">
            <label className="ne-label ne-full">
              Key Activities and Leadership
              <textarea name="activities" placeholder="Founder and president of coding club; robotics software lead" className="ne-input ne-textarea" />
            </label>
            <label className="ne-label ne-full">
              Honors and Awards
              <textarea name="awards" placeholder="State robotics finalist, National Merit Commended" className="ne-input ne-textarea" />
            </label>
          </div>
        </section>

        {/* Counseling Questions */}
        <section className="ne-card">
          <h2 className="ne-card-title">Neural Engine Counseling Questions</h2>
          <p className="ne-card-subtitle">Answer all prompts for better recommendation quality.</p>
          <div className="ne-grid">
            <label className="ne-label ne-full">
              1) What learning environment helps you perform at your best?
              <textarea name="question1" placeholder="e.g., Project-based classes, close professor access" className="ne-input ne-textarea" />
            </label>
            <label className="ne-label ne-full">
              2) What project or achievement best represents your strengths?
              <textarea name="question2" placeholder="e.g., Built a campus navigation app used by 300 students" className="ne-input ne-textarea" />
            </label>
            <label className="ne-label ne-full">
              3) What type of campus and location do you prefer?
              <textarea name="question3" placeholder="e.g., Mid-size urban campus with strong internship pipeline" className="ne-input ne-textarea" />
            </label>
            <label className="ne-label ne-full">
              4) How do you weigh affordability, prestige, and outcomes?
              <textarea name="question4" placeholder="e.g., Cost matters most; open to honors programs with scholarships" className="ne-input ne-textarea" />
            </label>
            <label className="ne-label ne-full">
              5) What are your intended career outcomes after graduation?
              <textarea name="question5" placeholder="e.g., Product management in health tech, then graduate school" className="ne-input ne-textarea" />
            </label>
            <label className="ne-label ne-full">
              6) What is your annual budget range for tuition + living costs? (Required)
              <input type="text" name="question6" placeholder="e.g., USD 25,000-40,000 per year" required className="ne-input" />
            </label>
            <label className="ne-label ne-full">
              7) Do you need scholarships, grants, or financial aid?
              <textarea name="question7" placeholder="e.g., Need merit scholarship of at least 30%" className="ne-input ne-textarea" />
            </label>
            <label className="ne-label ne-full">
              8) What type of support matters most to you at university?
              <textarea name="question8" placeholder="e.g., Mentorship, career services, international student advising" className="ne-input ne-textarea" />
            </label>
            <label className="ne-label ne-full">
              9) What extracurricular or community experiences do you want?
              <textarea name="question9" placeholder="e.g., Startup incubators, debate, research labs" className="ne-input ne-textarea" />
            </label>
          </div>
        </section>

        <button type="submit" className="ne-btn-primary" disabled={loading}>
          {loading ? 'Analyzing...' : 'Generate Match Report'}
        </button>
      </form>

      {/* ── Processing Modal ── */}
      {loading && (
        <div className="ne-modal-overlay">
          <div className="ne-modal">
            <div className="ne-loader" />
            <h3 className="ne-modal-title">Running Match Analysis</h3>
            <p className="ne-modal-subtitle">
              The Neural Engine is evaluating your profile, target fit, and alternatives worldwide.
            </p>
            <div className="ne-log-container">
              {logs.map((log, i) => (
                <div key={i} className="ne-log-entry">{log}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="ne-card ne-error">
          <p>{error}</p>
        </div>
      )}

      {/* ── Results ── */}
      {result && (
        <section className="ne-results">
          {result.mock && (
            <div className="ne-mock-banner">
              Sample analysis — AI service is not configured. Results are illustrative.
            </div>
          )}

          {/* Top: institution + score */}
          <div className="ne-results-top">
            <div>
              <p className="ne-kicker">Target School Match</p>
              <h2 className="ne-results-institution">{result.institution}</h2>
              {result.userTyped && result.userTyped !== result.institution && (
                <p className="ne-resolved-notice">
                  You typed &ldquo;{result.userTyped}&rdquo; — resolved to official name above.
                </p>
              )}
              <p className="ne-results-summary">{result.summary}</p>
            </div>
            <div className={`ne-score-pill ${scoreColorClass(result.targetMatchPercent)}`}>
              {result.targetMatchPercent}%
            </div>
          </div>

          {/* Strengths / Concerns / Next Steps */}
          <div className="ne-results-grid">
            <div className="ne-panel">
              <h3>Strengths</h3>
              <ul className="ne-insight-list">
                {result.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="ne-panel">
              <h3>Watchouts</h3>
              <ul className="ne-insight-list">
                {result.concerns.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
            <div className="ne-panel ne-panel-full">
              <h3>Recommended Next Steps</h3>
              <ul className="ne-insight-list">
                {result.nextSteps.map((ns, i) => (
                  <li key={i}>{ns}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Category Score Bars */}
          <div className="ne-panel">
            <h3>Fit Breakdown</h3>
            <div className="ne-score-bars">
              {result.categoryScores.map((cat) => (
                <div key={cat.label} className="ne-score-bar-row">
                  <span className="ne-score-bar-label">{cat.label}</span>
                  <div className="ne-score-bar-track">
                    <div
                      className={`ne-score-bar-fill ${scoreColorClass(cat.score)}`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                  <span className="ne-score-bar-value">{cat.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk label */}
          {result.risk && (
            <div className={`ne-panel ne-risk-panel ${RISK_CLASS[result.risk.label]}`}>
              <h3>
                <span className="ne-risk-dot" aria-hidden="true" />
                {RISK_TITLE[result.risk.label]}
              </h3>
              <p>{result.risk.message}</p>
            </div>
          )}

          {/* Expectation gap */}
          {result.expectation && (
            <div className="ne-panel">
              <h3>Profile vs. Target University</h3>
              <p>{result.expectation.message}</p>
            </div>
          )}

          {/* Alternatives — renamed per spec §9 */}
          <div className="ne-panel">
            <h3>Stronger Fits You May Be Overlooking</h3>
            <div className="ne-alternatives">
              {result.alternatives.map((alt) => (
                <div key={alt.name} className="ne-alt-card">
                  <div className="ne-alt-header">
                    <div>
                      <strong className="ne-alt-name">{alt.name}</strong>
                      <span className="ne-alt-country">{alt.country}</span>
                    </div>
                    <span className={`ne-alt-score ${scoreColorClass(alt.matchPercent)}`}>
                      {alt.matchPercent}%
                    </span>
                  </div>
                  <p className="ne-alt-why">{alt.why}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          {result.disclaimer && (
            <p className="ne-disclaimer">{result.disclaimer}</p>
          )}
        </section>
      )}
    </main>
  );
}
