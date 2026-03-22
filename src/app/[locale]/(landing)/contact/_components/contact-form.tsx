'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';

const BUDGET_OPTIONS = [
  'Under $10,000',
  '$10,000–$20,000',
  '$20,000–$30,000',
  '$30,000–$40,000',
  '$40,000+',
  'Flexible',
];

const SUPPORT_OPTIONS = [
  'Strategy Build',
  'Full Guidance',
  'Premium Mentorship',
  'Other',
];

interface FormState {
  studentFullName: string;
  parentWeChatId: string;
  parentPhone: string;
  parentEmail: string;
  studentSchool: string;
  studentGrade: string;
  graduationYear: string;
  grades: string;
  intendedMajors: string;
  targetCountries: string;
  budgetRange: string;
  supportNeeded: string;
  neuralEngineReport: string;
  notes: string;
  honeypot: string;
}

const initialState: FormState = {
  studentFullName: '',
  parentWeChatId: '',
  parentPhone: '',
  parentEmail: '',
  studentSchool: '',
  studentGrade: '',
  graduationYear: '',
  grades: '',
  intendedMajors: '',
  targetCountries: '',
  budgetRange: '',
  supportNeeded: '',
  neuralEngineReport: '',
  notes: '',
  honeypot: '',
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [fileName, setFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setForm((prev) => ({ ...prev, neuralEngineReport: file.name }));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSuccess(true);
      setForm(initialState);
      setFileName('');
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="contact-success">
        <div className="contact-success-icon" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="rgba(17,74,114,0.1)" />
            <path
              d="M16 24l6 6 10-12"
              stroke="var(--brand)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
        <h3>Inquiry Submitted</h3>
        <p>
          Thank you for reaching out. We will review your information and
          respond within 1 business day. Check your email for next steps.
        </p>
        <button
          className="l-btn-primary"
          type="button"
          onClick={() => setSuccess(false)}
        >
          Submit Another Inquiry
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      {/* Honeypot — invisible to real users */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
        <label>
          Leave this blank
          <input
            type="text"
            name="honeypot"
            value={form.honeypot}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      <div className="contact-form-row">
        <label className="contact-field">
          <span className="contact-label">
            Student Full Name <span className="contact-req">*</span>
          </span>
          <input
            type="text"
            name="studentFullName"
            value={form.studentFullName}
            onChange={handleChange}
            placeholder="Full name"
            required
          />
        </label>

        <label className="contact-field">
          <span className="contact-label">Parent WeChat ID</span>
          <input
            type="text"
            name="parentWeChatId"
            value={form.parentWeChatId}
            onChange={handleChange}
            placeholder="WeChat ID"
          />
        </label>
      </div>

      <div className="contact-form-row">
        <label className="contact-field">
          <span className="contact-label">Parent Phone Number</span>
          <input
            type="tel"
            name="parentPhone"
            value={form.parentPhone}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
          />
        </label>

        <label className="contact-field">
          <span className="contact-label">
            Parent Email <span className="contact-req">*</span>
          </span>
          <input
            type="email"
            name="parentEmail"
            value={form.parentEmail}
            onChange={handleChange}
            placeholder="email@example.com"
            required
          />
        </label>
      </div>

      <div className="contact-form-row">
        <label className="contact-field">
          <span className="contact-label">Student Current School</span>
          <input
            type="text"
            name="studentSchool"
            value={form.studentSchool}
            onChange={handleChange}
            placeholder="School name"
          />
        </label>

        <label className="contact-field">
          <span className="contact-label">Student Current Grade</span>
          <input
            type="text"
            name="studentGrade"
            value={form.studentGrade}
            onChange={handleChange}
            placeholder="e.g., Grade 11"
          />
        </label>
      </div>

      <div className="contact-form-row">
        <label className="contact-field">
          <span className="contact-label">Expected HS Graduation Year</span>
          <input
            type="text"
            name="graduationYear"
            value={form.graduationYear}
            onChange={handleChange}
            placeholder="e.g., 2026"
          />
        </label>

        <label className="contact-field">
          <span className="contact-label">Grades — SAT/ACT, A Levels, IB</span>
          <input
            type="text"
            name="grades"
            value={form.grades}
            onChange={handleChange}
            placeholder="e.g., SAT 1490, IB 40/45"
          />
        </label>
      </div>

      <label className="contact-field contact-field-full">
        <span className="contact-label">Intended Major(s)</span>
        <input
          type="text"
          name="intendedMajors"
          value={form.intendedMajors}
          onChange={handleChange}
          placeholder="e.g., Computer Science, Economics"
        />
      </label>

      <label className="contact-field contact-field-full">
        <span className="contact-label">Target Countries / Universities</span>
        <input
          type="text"
          name="targetCountries"
          value={form.targetCountries}
          onChange={handleChange}
          placeholder="e.g., USA + UK, top engineering programs"
        />
      </label>

      <div className="contact-form-row">
        <label className="contact-field">
          <span className="contact-label">Budget Range</span>
          <select
            name="budgetRange"
            value={form.budgetRange}
            onChange={handleChange}
          >
            <option value="">Select a range</option>
            {BUDGET_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <label className="contact-field">
          <span className="contact-label">Support Needed</span>
          <select
            name="supportNeeded"
            value={form.supportNeeded}
            onChange={handleChange}
          >
            <option value="">Select a tier</option>
            {SUPPORT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="contact-field contact-field-full">
        <span className="contact-label">Upload Neural Engine Report</span>
        <div className="contact-file-wrap">
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="contact-file-input"
          />
          <div className="contact-file-display">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M10 3v10m0 0l-3-3m3 3l3-3M4 15h12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{fileName || 'Choose a file (PDF, PNG, JPEG — max 10 MB)'}</span>
          </div>
        </div>
      </label>

      <label className="contact-field contact-field-full">
        <span className="contact-label">What else would you like us to know?</span>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Share key goals, concerns, timeline, or anything relevant"
          rows={4}
        />
      </label>

      {error && (
        <div className="contact-error" role="alert">
          {error}
        </div>
      )}

      <button
        className="l-btn-primary contact-submit"
        type="submit"
        disabled={submitting}
      >
        {submitting ? 'Submitting…' : 'Submit Consultation Request'}
      </button>
    </form>
  );
}
