import type { Metadata } from 'next';
import { FAQSection } from '../_components/faq-section';
import { CONTACT_FAQ } from '@/lib/landing-data';
import { ContactForm } from './_components/contact-form';

export const metadata: Metadata = {
  title: 'Contact SAJU | Book a Strategy Consultation',
  description:
    'Book a strategy consultation with SAJU. Share your admissions context for personalized guidance.',
};

export default function ContactPage() {
  return (
    <main className="page">
      {/* ─── HERO ─── */}
      <section className="contact-hero">
        <p className="eyebrow">Get Started</p>
        <h1>Book a Strategy Consultation with SAJU</h1>
        <p className="contact-hero-lead">
          Tell us about the student, target programs, and budget. We will
          recommend the right support level and outline immediate next actions.
        </p>
        <a className="l-btn-primary" href="#inquiry">
          Submit Inquiry
        </a>
      </section>

      {/* ─── INQUIRY FORM ─── */}
      <section className="section" id="inquiry">
        <div className="section-head">
          <p className="eyebrow">Inquiry Form</p>
          <h2>Share Your Admissions Context</h2>
          <p>We use this to prepare a focused first consultation.</p>
        </div>
        <div className="contact-form-container">
          <ContactForm />
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <FAQSection heading="Before You Book" items={CONTACT_FAQ} />

      {/* ─── CONTACT CHANNELS ─── */}
      <section className="section">
        <div className="section-head">
          <p className="eyebrow">Reach Us</p>
          <h2>Contact Channels</h2>
        </div>
        <div className="contact-channels">
          <div className="contact-channel-card">
            <h3>Email</h3>
            <p>admissions@saju.edu</p>
          </div>
          <div className="contact-channel-card">
            <h3>Phone</h3>
            <p>+1 (XXX) XXX-XXXX</p>
          </div>
          <div className="contact-channel-card">
            <h3>WeChat</h3>
            <p>XXXXXXXXX</p>
          </div>
          <div className="contact-channel-card">
            <h3>XiaoHongShu</h3>
            <p>XXXXXXXXX</p>
          </div>
          <div className="contact-channel-card">
            <h3>Office Address</h3>
            <p>XXXXXXXXX</p>
          </div>
          <div className="contact-channel-card">
            <h3>Office Hours</h3>
            <p>Monday – Friday, 9:00 AM – 7:00 PM (local team time zones)</p>
          </div>
        </div>
      </section>
    </main>
  );
}
