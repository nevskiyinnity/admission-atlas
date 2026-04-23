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

/* ── Helper: build downloadable plain-text report ── */

function buildReportText(r: AnalysisResult): string {
  const lines: string[] = [];
  const rule = '─'.repeat(60);

  lines.push('SAJU UNIVERSITY FIT ASSESSMENT');
  lines.push(rule);
  lines.push(`Target University: ${r.institution}`);
  lines.push(`Target School Match: ${r.targetMatchPercent}%`);
  if (r.risk) lines.push(`Risk Category: ${r.risk.label.toUpperCase()}`);
  lines.push('');
  lines.push('SUMMARY');
  lines.push(rule);
  lines.push(r.summary);
  lines.push('');
  if (r.risk) {
    lines.push('RISK CATEGORY MESSAGE');
    lines.push(rule);
    lines.push(r.risk.message);
    lines.push('');
  }
  if (r.expectation) {
    lines.push('PROFILE vs. TARGET UNIVERSITY');
    lines.push(rule);
    lines.push(r.expectation.message);
    lines.push('');
  }
  lines.push('STRENGTHS');
  lines.push(rule);
  r.strengths.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
  lines.push('');
  lines.push('WATCHOUTS');
  lines.push(rule);
  r.concerns.forEach((c, i) => lines.push(`${i + 1}. ${c}`));
  lines.push('');
  lines.push('RECOMMENDED NEXT STEPS');
  lines.push(rule);
  r.nextSteps.forEach((n, i) => lines.push(`${i + 1}. ${n}`));
  lines.push('');
  lines.push('FIT BREAKDOWN');
  lines.push(rule);
  r.categoryScores.forEach((cat) => lines.push(`${cat.label.padEnd(16)} ${cat.score}%`));
  lines.push('');
  lines.push('STRONGER FITS YOU MAY BE OVERLOOKING');
  lines.push(rule);
  r.alternatives.forEach((alt) => {
    lines.push(`${alt.name} (${alt.country}) — ${alt.matchPercent}%`);
    lines.push(`  ${alt.why}`);
    lines.push('');
  });
  if (r.disclaimer) {
    lines.push(rule);
    lines.push(r.disclaimer);
  }
  return lines.join('\n');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/* ── Page Component ── */

export default function NeuralEnginePage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Consent (spec §3)
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  // Secondary CTA: email flow (visual-only — no backend send)
  const [emailMode, setEmailMode] = useState<'idle' | 'input' | 'sending' | 'sent'>('idle');
  const [emailValue, setEmailValue] = useState('');

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setEmailMode('idle');
    setEmailValue('');
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

  const handleDownload = useCallback(() => {
    if (!result) return;
    const content = buildReportText(result);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAJU-Fit-Assessment-${result.institution.replace(/[^a-z0-9]/gi, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [result]);

  const handleEmailSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValidEmail(emailValue)) return;
    setEmailMode('sending');
    // Visual-only: simulate a send. No backend call — spec deferred.
    setTimeout(() => setEmailMode('sent'), 900);
  }, [emailValue]);

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

        {/* Consent (spec §3) */}
        <section className="ne-card ne-consent-card">
          <label className="ne-consent-row">
            <input
              type="checkbox"
              checked={privacyConsent}
              onChange={(e) => setPrivacyConsent(e.target.checked)}
              aria-required="true"
            />
            <span>
              I agree to the company&apos;s{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>{' '}and{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Use</a>.
              <span className="ne-consent-required" aria-hidden="true"> *</span>
            </span>
          </label>
          <label className="ne-consent-row">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
            />
            <span>
              I agree to receive email updates about webinars, relevant information,
              and occasional promotional content.
            </span>
          </label>
        </section>

        <button
          type="submit"
          className="ne-btn-primary"
          disabled={loading || !privacyConsent}
          aria-disabled={loading || !privacyConsent}
        >
          {loading ? 'Analyzing...' : 'Generate Match Report'}
        </button>
        {!privacyConsent && !loading && (
          <p className="ne-consent-hint">Please agree to the Privacy Policy and Terms of Use to generate your report.</p>
        )}
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

          {/* Post-report CTAs (spec §2) */}
          <div className="ne-cta-block">
            <a className="ne-btn-primary ne-cta-primary" href="/contact">
              Book Personalized Strategy Consultation
              <span aria-hidden="true">&nbsp;&rarr;</span>
            </a>

            <div className="ne-cta-secondary">
              {emailMode === 'idle' && (
                <div className="ne-cta-secondary-row">
                  <button
                    type="button"
                    className="ne-btn-secondary"
                    onClick={() => setEmailMode('input')}
                  >
                    Email Me the Report
                  </button>
                  <span className="ne-cta-separator" aria-hidden="true">or</span>
                  <button
                    type="button"
                    className="ne-btn-ghost"
                    onClick={handleDownload}
                  >
                    Download Report
                  </button>
                </div>
              )}

              {(emailMode === 'input' || emailMode === 'sending') && (
                <form className="ne-email-form" onSubmit={handleEmailSubmit}>
                  <label className="ne-email-label">
                    <span>Send the report to your inbox</span>
                    <input
                      type="email"
                      className="ne-input"
                      placeholder="you@example.com"
                      value={emailValue}
                      onChange={(e) => setEmailValue(e.target.value)}
                      required
                      autoComplete="email"
                      disabled={emailMode === 'sending'}
                    />
                  </label>
                  <div className="ne-email-actions">
                    <button
                      type="submit"
                      className="ne-btn-secondary"
                      disabled={emailMode === 'sending' || !isValidEmail(emailValue)}
                    >
                      {emailMode === 'sending' ? 'Sending…' : 'Send Report'}
                    </button>
                    <button
                      type="button"
                      className="ne-btn-ghost"
                      onClick={() => setEmailMode('idle')}
                      disabled={emailMode === 'sending'}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {emailMode === 'sent' && (
                <div className="ne-email-success" role="status">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>Your report has been sent successfully. Check your inbox.</span>
                </div>
              )}
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
