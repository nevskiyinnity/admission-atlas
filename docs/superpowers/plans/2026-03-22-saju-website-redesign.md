# SAJU Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand Admission Atlas to 双岸教育/SAJU across all landing pages, implement feedback from design review (new pages, restructured sections, new contact form, Neural Engine port).

**Architecture:** Incremental page-by-page approach. First extract shared layout components (header/footer) and fix middleware, then rework each page. Shared UI components (WhyUsAccordion, PricingCards, ReviewsCarousel, CounselorCard, FAQ) are built once and reused across pages.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS (existing custom CSS), Prisma (PostgreSQL), Clerk auth, next-intl (en/zh), GSAP + Lenis animations, @vercel/blob, OpenAI, Zod, @upstash/ratelimit

**Spec:** `docs/superpowers/specs/2026-03-22-saju-website-redesign-design.md`

---

## File Structure

### New Files

```
src/app/[locale]/(landing)/
├── _components/
│   ├── landing-header.tsx          # Shared header with nav, language switcher, mobile menu
│   ├── landing-footer.tsx          # Shared footer with contact info, social links
│   ├── language-switcher.tsx       # EN/ZH toggle (client component)
│   ├── mobile-menu.tsx             # Hamburger menu (client component)
│   ├── why-us-accordion.tsx        # 8-trait accordion with variant prop (client component)
│   ├── pricing-cards.tsx           # 3-tier pricing section (server component)
│   ├── reviews-carousel.tsx        # Manual testimonials carousel (client component)
│   ├── counselor-card.tsx          # Counselor card with video, tags, description
│   ├── faq-section.tsx             # Reusable FAQ accordion
│   └── case-study-card.tsx         # Case study card for Results page
├── about/
│   └── page.tsx                    # About Us page (NEW)
├── college-admissions/
│   └── page.tsx                    # College Admissions page (NEW)
├── counselors/
│   └── page.tsx                    # Counselors page (replaces /team)
├── neural-engine/
│   └── page.tsx                    # Neural Engine UI (ported)
src/app/api/
├── neural-engine/
│   └── route.ts                    # Public Neural Engine API (ported from Express)
├── inquiries/
│   └── route.ts                    # Public contact form submission API
src/lib/
├── neural-engine-rate-limit.ts     # Dedicated 10 req/min limiter for Neural Engine
├── inquiry-schema.ts               # Zod schema for contact form validation
└── landing-data.ts                 # Hardcoded data: reviews, case studies, counselors, traits
messages/
├── en.json                         # Add 'landing' namespace
└── zh.json                         # Add 'landing' namespace (empty strings for Phase 1)
prisma/
└── schema.prisma                   # Add InquirySubmission model
```

### Modified Files

```
src/middleware.ts                    # publicPages, authOnlyPages, isPublicRoute, /team redirect
src/app/[locale]/(landing)/
├── layout.tsx                      # Add LandingHeader + LandingFooter, update noscript
├── page.tsx                        # Rework Home page sections
├── contact/page.tsx                # Major rework with 14-field form
├── results/page.tsx                # Major rework with case studies
├── team/page.tsx                   # Replace with redirect to /counselors
├── landing-home.css                # Update for reordered sections, new section colors
└── landing-atlas.css               # Shared styles for new pages
```

---

## Task 1: Middleware Updates

**Files:**
- Modify: `src/middleware.ts`

- [ ] **Step 1: Update publicPages array**

In `src/middleware.ts`, replace the `publicPages` array (line 10):

```typescript
const publicPages = ['/', '/about', '/college-admissions', '/counselors', '/results', '/contact', '/neural-engine', '/login', '/forgot-password'];
```

- [ ] **Step 2: Add authOnlyPages and fix authenticated redirect**

Add `authOnlyPages` after `publicPages`:

```typescript
const authOnlyPages = ['/login', '/forgot-password'];
```

Replace the authenticated-user redirect block (lines 117-121):

```typescript
// Authenticated user on auth-only page (login, forgot-password) → redirect to dashboard
const isAuthOnlyPage = authOnlyPages.some(
  (page) => pathnameWithoutLocale === page || pathnameWithoutLocale.startsWith(page)
);
if (isAuthOnlyPage && userId) {
  const home = roleHomeMap[role || ''] || '/login';
  const locale = pathname.match(/^\/(en|zh)/)?.[1] || 'en';
  return NextResponse.redirect(new URL(`/${locale}${home}`, req.url));
}
```

- [ ] **Step 3: Update isPublicRoute matcher**

Replace the `isPublicRoute` matcher (lines 40-46):

```typescript
const isPublicRoute = createRouteMatcher([
  '/(en|zh)',
  '/(en|zh)/(about|college-admissions|counselors|results|contact|neural-engine)(.*)',
  '/(en|zh)/login(.*)',
  '/(en|zh)/forgot-password(.*)',
  '/api/webhooks/(.*)',
]);
```

- [ ] **Step 4: Add /team → /counselors redirect**

After the bare root redirect block (after line 98), add:

```typescript
// Redirect /team → /counselors (301 permanent)
if (pathnameWithoutLocale === '/team' || pathnameWithoutLocale.startsWith('/team/')) {
  const locale = pathname.match(/^\/(en|zh)/)?.[1] || 'en';
  const newPath = pathnameWithoutLocale.replace('/team', '/counselors');
  return NextResponse.redirect(new URL(`/${locale}${newPath}`, req.url), 301);
}
```

Wait — the `/team` redirect must happen before intlMiddleware is applied. Move it right after the bare root redirect (line 98) and before `const intlResponse = intlMiddleware(req)` (line 101). Also, this logic uses `pathnameWithoutLocale` which isn't computed until line 104. So compute the locale-stripped path earlier:

```typescript
// After the bare root redirect block, before intlMiddleware:
const pathNoLocale = pathname.replace(/^\/(en|zh)/, '') || '/';
if (pathNoLocale === '/team' || pathNoLocale.startsWith('/team/')) {
  const locale = pathname.match(/^\/(en|zh)/)?.[1] || 'en';
  return applySecurityHeaders(
    NextResponse.redirect(new URL(`/${locale}/counselors`, req.url), 301)
  );
}
```

- [ ] **Step 5: Verify dev server starts without errors**

Run: `cd /Users/iliazharnikov/Documents/GitHub/admission-atlas && npm run dev`
Expected: Dev server starts, visit `http://localhost:3000/en` — should load landing page without redirect loop.

- [ ] **Step 6: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: update middleware for SAJU rebrand — new routes, auth redirect fix, /team→/counselors"
```

---

## Task 2: Hardcoded Data + Shared Types

**Files:**
- Create: `src/lib/landing-data.ts`

This file centralizes all hardcoded content data used across landing pages. Pages import from here instead of duplicating strings.

- [ ] **Step 1: Create landing-data.ts with all content data**

```typescript
// src/lib/landing-data.ts

// ── Types ──

export interface Trait {
  title: string;
  description: string;
}

export interface Review {
  name: string;
  location: string;
  date: string;
  text: string;
  rating: number;
}

export interface CounselorProfile {
  name: string;
  title: string;
  description: string;
  tags: string[];
  videoUrl?: string; // YouTube/Vimeo embed URL — placeholder until provided
  posterImage: string; // path to poster image
}

export interface PricingTier {
  tier: string;
  name: string;
  features: string[];
  popular?: boolean;
  ctaText: string;
  ctaHref: string;
}

export interface CaseStudy {
  name: string;
  photo: string;
  challenges: string[];
  result: string;
  uniLogo: string;
  academics: string;
  initialProfile: string;
  extracurriculars: string;
  changesMade: string;
  otherInfo: string;
  outcome: string;
}

export interface BeforeAfter {
  before: string;
  after: string;
}

export interface PhaseDetail {
  id: string;
  title: string;
  description: string;
  traits: string[];
  image: string;
  hasButtons: boolean;
}

export interface LeadershipMember {
  name: string;
  role: string;
  photo: string;
}

// ── Data ──

export const WHY_US_TRAITS: Trait[] = [
  { title: 'Customized Counselor Assignment', description: 'Holistic and personalized strategy tailored to each student\'s unique profile, goals, and circumstances.' },
  { title: 'Better Organization Through Our Platform', description: 'Our proprietary platform keeps every document, deadline, and milestone in one place — nothing gets lost.' },
  { title: 'Insider Knowledge from European Network', description: 'Direct insights from our counselor network across UK, European, and global admissions systems.' },
  { title: 'Student Fit & Transparency', description: 'We prioritize finding the right fit over prestige. Every recommendation is backed by data and explained clearly.' },
  { title: 'Peer Review Feedback', description: 'Applications are reviewed by multiple counselors to catch blind spots and strengthen positioning.' },
  { title: 'Bi-weekly Feedback Meetings with Parents', description: 'Regular parent updates ensure alignment on strategy, timeline, and expectations throughout the process.' },
  { title: 'Passion Project Development', description: 'Guidance on developing meaningful extracurricular projects that authentically showcase the student\'s interests.' },
  { title: 'Relocation Assistance', description: 'Support with visa planning, housing research, and transition logistics for students moving abroad.' },
];

export const REVIEWS: Review[] = [
  { name: 'Maria S.', location: 'New York', date: 'January 16', text: 'My experience with SAJU was... My daughter got into her top choice school.', rating: 5 },
  { name: 'Sarah M.', location: 'Beijing', date: 'January 24', text: 'I felt the most amazing experience... The team truly cares about each student.', rating: 5 },
  { name: 'Katie Apple', location: 'London', date: 'January 16', text: 'SAJU made the daunting process manageable. Their structured approach eliminated our anxiety.', rating: 5 },
  { name: 'Robert Chen', location: 'Singapore', date: 'February 8', text: 'SAJU\'s team made it difficult to... The results speak for themselves.', rating: 5 },
];

export const COUNSELORS: CounselorProfile[] = [
  {
    name: 'James',
    title: 'College Admissions Counselor',
    description: 'Leads school list architecture and admissions positioning across US and Canada pathways. Has guided 200+ students through competitive application cycles at top-30 universities.',
    tags: ['List Engineering', 'STEM Strategy', 'US & Canada'],
    posterImage: '/images/counselors/james.jpg',
  },
  {
    name: 'Chris',
    title: 'College Admissions Counselor',
    description: 'Transforms student achievements into coherent, high-signal application narratives. Former writing instructor at Columbia University with deep expertise in personal statement strategy.',
    tags: ['Essays', 'Story Design', 'Supplements'],
    posterImage: '/images/counselors/chris.jpg',
  },
];

export const PRICING_TIERS: PricingTier[] = [
  {
    tier: 'Foundation',
    name: 'Strategy Build',
    features: ['Initial profile diagnostic', 'School list architecture', 'Budget-fit planning', 'Strategy roadmap'],
    ctaText: 'Request Details',
    ctaHref: '/contact',
  },
  {
    tier: 'Comprehensive',
    name: 'Full Guidance',
    features: ['Everything in Foundation', 'Essay & narrative direction', 'Application review cycles', 'Submission quality control'],
    popular: true,
    ctaText: 'Book Consultation',
    ctaHref: '/contact',
  },
  {
    tier: 'Intensive',
    name: 'Premium Mentorship',
    features: ['Everything in Full Guidance', 'High-frequency advisor sessions', 'Advanced scholarship strategy', 'Interview prep & final polish'],
    ctaText: 'Request Details',
    ctaHref: '/contact',
  },
];

export const CASE_STUDIES: CaseStudy[] = [
  // Placeholder data — to be replaced with real case studies
  { name: 'Student A', photo: '/images/cases/placeholder.jpg', challenges: ['Unclear academic direction', 'Weak extracurricular profile'], result: 'Accepted to target university', uniLogo: '/images/unis/placeholder.png', academics: 'GPA 3.8, SAT 1480', initialProfile: 'Unfocused application strategy', extracurriculars: 'Limited leadership roles', changesMade: 'Developed research project, refined essay narrative', otherInfo: '', outcome: 'Accepted with merit scholarship' },
  { name: 'Student B', photo: '/images/cases/placeholder.jpg', challenges: ['Budget constraints', 'Late start'], result: 'Multiple acceptances', uniLogo: '/images/unis/placeholder.png', academics: 'GPA 3.6, IB 38', initialProfile: 'Strong academics but weak positioning', extracurriculars: 'Multiple activities, no depth', changesMade: 'Focused narrative, strategic school list', otherInfo: '', outcome: 'Accepted to 4 of 6 targets with aid' },
  { name: 'Student C', photo: '/images/cases/placeholder.jpg', challenges: ['International applicant', 'Visa concerns'], result: 'Accepted to dream school', uniLogo: '/images/unis/placeholder.png', academics: 'GPA 3.9, A-Levels AAA', initialProfile: 'Strong but unfocused on UK vs US', extracurriculars: 'Research and community service', changesMade: 'Cross-region strategy, interview prep', otherInfo: '', outcome: 'Accepted to Oxbridge and US top-20' },
  { name: 'Student D', photo: '/images/cases/placeholder.jpg', challenges: ['Scattered profile', 'Confusion from varying advice'], result: 'Clear strategy, strong outcome', uniLogo: '/images/unis/placeholder.png', academics: 'GPA 3.7, SAT 1520', initialProfile: 'Too many advisors, conflicting direction', extracurriculars: 'Strong but poorly presented', changesMade: 'Unified narrative, single point of strategy', otherInfo: '', outcome: 'Accepted to top-choice with full aid' },
];

export const BEFORE_AFTER: BeforeAfter[] = [
  { before: 'Unclear academic direction — scattered course selection with no coherent story for admissions officers.', after: 'Focused academic trajectory aligned with intended major, supported by targeted extracurriculars and research.' },
  { before: 'Weak profile narrative — achievements listed but not connected into a compelling, authentic story.', after: 'Unified personal narrative that connects background, activities, and goals into a memorable application.' },
  { before: 'Confusion from scattered, varying information — multiple sources of advice leading to paralysis.', after: 'Single, structured strategy with clear milestones, deadlines, and quality gates at every step.' },
];

export const PHASES: PhaseDetail[] = [
  { id: 'phase-1', title: 'Phase 1: Initial Consultation & Diagnostic', description: 'Comprehensive assessment of student profile, goals, constraints, and strategic baseline.', traits: ['School Placement', 'Tutoring and Executive Functioning Development'], image: '/images/phases/phase1.jpg', hasButtons: true },
  { id: 'phase-2', title: 'Phase 2: Portfolio Design & Strategy', description: 'School list architecture, major-fit positioning, and application strategy across regions and budgets.', traits: ['School List Architecture', 'Major-Fit Analysis'], image: '/images/phases/phase2.jpg', hasButtons: false },
  { id: 'phase-3', title: 'Phase 3: Narrative & Materials', description: 'Personal narrative development, essay drafting, and supplemental material preparation.', traits: ['Essay Direction', 'Narrative Strategy'], image: '/images/phases/phase3.jpg', hasButtons: false },
  { id: 'phase-4', title: 'Phase 4: Application Execution', description: 'Application review cycles, submission quality control, and deadline management.', traits: ['Application Review', 'Submission Control'], image: '/images/phases/phase4.jpg', hasButtons: true },
  { id: 'phase-5', title: 'Phase 5: Interview Prep & Final Polish', description: 'Interview preparation, scholarship applications, and final application refinement.', traits: ['Interview Preparation', 'Scholarship Strategy'], image: '/images/phases/phase5.jpg', hasButtons: false },
];

export const LEADERSHIP: LeadershipMember[] = [
  { name: 'Jamie B.', role: 'CEO / Co-founder', photo: '/images/team/jamie.jpg' },
  { name: 'Fangzhou J.', role: 'Co-founder & Product Officer', photo: '/images/team/fangzhou.jpg' },
  { name: 'Arkesh P.', role: 'Chief Operating Officer', photo: '/images/team/arkesh.jpg' },
];

export const OPERATING_PRINCIPLES = [
  { title: 'Clarity First', description: 'Every recommendation includes explicit rationale and trade-offs. No vague platitudes. No "just trust the process."' },
  { title: 'Evidence Over Guesswork', description: 'Strategy is anchored in profile evidence, admissions committee reality, and realistic execution capability — not aspirational thinking.' },
  { title: 'Budget Integrity', description: 'Cost constraints are part of the strategy from the beginning, not added after the architecture is already set.' },
  { title: 'Execution Discipline', description: 'Deadlines, document quality, and revision cycles are managed rigorously. No last-minute scrambles or half-finished work.' },
  { title: 'Global Perspective', description: 'We help students investigate options outside familiar geographies when fit, cost, or outcomes change favorably.' },
  { title: 'Student Ownership', description: 'Students are supported to make informed decisions and express authentic strengths — not fabricated profiles.' },
];

export const HOME_FAQ = [
  { question: 'Do you support students applying outside the US?', answer: 'Yes. We support applications to the US, UK, Canada, Europe, Singapore, Australia, and more. Cross-region strategies are one of our strongest areas.' },
  { question: 'When is the best time to start?', answer: 'Earlier is better. Starting in sophomore or junior year means activities, rigor, and narrative can compound over time — but we regularly work with seniors on tight timelines too.' },
  { question: 'Is affordability factored into your recommendations?', answer: 'Always. Budget and aid constraints are built into strategy from Day 1, not bolted on as an afterthought. We won\'t recommend schools you can\'t realistically attend.' },
  { question: 'What makes this different from other college counselors?', answer: 'We use a structured, milestone-based system — not vague pep talks. Every engagement has clear deliverables, timelines, and quality gates.' },
];

export const CONTACT_FAQ = [
  { question: 'Can you work with us if we are early in high school?', answer: 'Absolutely. Students in 8th-10th grade benefit from early strategic planning — building the right course load, activities, and positioning from the start.' },
  { question: 'Do we need to know our final university list before reaching out?', answer: 'Not at all. Building a well-balanced, strategic school list is one of the core services we provide. Come with your goals and constraints — we will help build the list.' },
  { question: 'Can you help with scholarship-focused planning?', answer: 'Yes. Budget and scholarship strategy is integrated into every tier of our service. We can help identify merit-based and need-based opportunities aligned with your profile.' },
];

export const GLOBAL_REGIONS = [
  { code: 'US', name: 'North America', description: 'Full-service counseling and strategy for US and Canadian university applications across all tiers.' },
  { code: 'GB', name: 'Europe & UK', description: 'Country-specific guidance for UK, EU, and Swiss applications — including UCAS pathways and Bologna-system navigation.' },
  { code: 'SG', name: 'Asia-Pacific', description: 'Support for students targeting programs in Singapore, Australia, Hong Kong, and other Asia-Pacific destinations.' },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/landing-data.ts
git commit -m "feat: add centralized landing page data — reviews, counselors, case studies, traits"
```

---

## Task 3: Shared Components — Header, Footer, Language Switcher

**Files:**
- Create: `src/app/[locale]/(landing)/_components/landing-header.tsx`
- Create: `src/app/[locale]/(landing)/_components/landing-footer.tsx`
- Create: `src/app/[locale]/(landing)/_components/language-switcher.tsx`
- Create: `src/app/[locale]/(landing)/_components/mobile-menu.tsx`
- Modify: `src/app/[locale]/(landing)/layout.tsx`

- [ ] **Step 1: Create language-switcher.tsx**

Client component using `useRouter` and `usePathname` from `@/i18n/routing`:

```typescript
'use client';

import { useRouter, usePathname } from '@/i18n/routing';
import { useLocale } from 'next-intl';

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const toggleLocale = () => {
    const newLocale = locale === 'en' ? 'zh' : 'en';
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <button
      onClick={toggleLocale}
      className="lang-switch"
      aria-label={`Switch to ${locale === 'en' ? '中文' : 'English'}`}
    >
      <span className="lang-switch-icon">🌐</span>
      {locale === 'en' ? '中文' : 'EN'}
    </button>
  );
}
```

- [ ] **Step 2: Create mobile-menu.tsx**

Client component with hamburger toggle:

```typescript
'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';

const NAV_LINKS = [
  { href: '/about', label: 'About Us' },
  { href: '/college-admissions', label: 'College Admissions' },
  { href: '/counselors', label: 'Counselors' },
  { href: '/results', label: 'Results' },
  { href: '/contact', label: 'Contact' },
  { href: '/login', label: 'SAJU Portal' },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="mobile-menu-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        <span className={`hamburger ${open ? 'hamburger--open' : ''}`} />
      </button>
      {open && (
        <div className="mobile-menu-overlay" onClick={() => setOpen(false)}>
          <nav className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href="/neural-engine" className="mobile-menu-cta" onClick={() => setOpen(false)}>
              SAJU Engine
            </Link>
            <Link href="/contact" className="mobile-menu-cta mobile-menu-cta--primary" onClick={() => setOpen(false)}>
              Book a Call
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 3: Create landing-header.tsx**

```typescript
import { Link } from '@/i18n/routing';
import { LanguageSwitcher } from './language-switcher';
import { MobileMenu } from './mobile-menu';

export function LandingHeader() {
  return (
    <header className="l-header">
      <div className="l-header-inner">
        <Link className="l-brand" href="/">
          双岸教育
        </Link>
        <nav className="l-nav-links">
          <Link href="/about">About Us</Link>
          <Link href="/college-admissions">College Admissions</Link>
          <Link href="/counselors">Counselors</Link>
          <Link href="/results">Results</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/login">SAJU Portal</Link>
        </nav>
        <div className="l-nav-right">
          <LanguageSwitcher />
          <Link href="/neural-engine" className="l-btn-ghost">
            SAJU Engine
          </Link>
          <Link href="/contact" className="l-btn-primary">
            Book a Call
          </Link>
        </div>
        <MobileMenu />
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Create landing-footer.tsx**

```typescript
import { Link } from '@/i18n/routing';

export function LandingFooter() {
  return (
    <footer className="l-footer">
      <div className="l-footer-inner">
        <div className="l-footer-brand">
          <span className="l-footer-logo">双岸教育</span>
          <span className="l-footer-tagline">Strategic admissions counsel.</span>
        </div>
        <div className="l-footer-contact">
          <h4>Contact</h4>
          <p>Email: info@shuanganjiayu.com</p>
          <p>Tel: XXXXXXXXXXX</p>
          <p>WeChat: XXXXXXXXX</p>
          <p>XiaoHongShu: XXXXXXXXX</p>
          <p>No.6 Haidian Zhongjie, Haidian District, Beijing 100080 PRC</p>
          <p>Monday–Friday | 9am–6pm ET</p>
        </div>
        <div className="l-footer-social">
          <h4>Follow Us</h4>
          {/* WeChat and XiaoHongShu icons — placeholder links */}
          <a href="#" aria-label="WeChat">WeChat</a>
          <a href="#" aria-label="XiaoHongShu">XiaoHongShu</a>
        </div>
        <nav className="l-footer-nav">
          <Link href="/counselors">Counselors</Link>
          <Link href="/results">Results</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/login">Log in</Link>
        </nav>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Update layout.tsx to include header and footer**

Modify `src/app/[locale]/(landing)/layout.tsx` to wrap children with shared header/footer and update the noscript block:

```typescript
import {
  DM_Serif_Display, Manrope, Space_Grotesk,
  Instrument_Serif, Plus_Jakarta_Sans,
} from 'next/font/google';
import './landing-atlas.css';
import './landing-home.css';
import './landing-animations.css';
import { LandingHeader } from './_components/landing-header';
import { LandingFooter } from './_components/landing-footer';

// ... font declarations unchanged ...

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`landing-scope ${dmSerif.variable} ${manrope.variable} ${spaceGrotesk.variable} ${instrumentSerif.variable} ${jakartaSans.variable}`}>
      <noscript>
        <style>{`
          .landing-scope .shell > *,
          .landing-scope [class*="sect"],
          .landing-scope [class*="hero"] > * {
            opacity: 1 !important;
            transform: none !important;
          }
        `}</style>
      </noscript>
      <LandingHeader />
      {children}
      <LandingFooter />
    </div>
  );
}
```

- [ ] **Step 6: Remove inline header and footer from Home page**

In `src/app/[locale]/(landing)/page.tsx`, remove:
- The `<header className="h-nav">...</header>` block (lines 23-44)
- The `<footer className="h-foot">...</footer>` block (lines 479-493)

These are now in the shared layout.

- [ ] **Step 7: Remove inline headers from other pages**

Remove the inline `<header>` blocks from:
- `src/app/[locale]/(landing)/contact/page.tsx` (lines 17-30)
- `src/app/[locale]/(landing)/results/page.tsx` (lines 16-30)
- `src/app/[locale]/(landing)/team/page.tsx` (lines 15-30)

- [ ] **Step 8: Add CSS for shared header/footer**

Add to `landing-atlas.css` the styles for `.l-header`, `.l-footer`, `.l-nav-links`, `.l-btn-primary`, `.l-btn-ghost`, `.lang-switch`, `.mobile-menu-*`, etc. Follow the existing CSS variable patterns and design language. The header should be sticky, translucent on scroll.

- [ ] **Step 9: Verify all existing pages render with shared header/footer**

Run dev server, check: `/en`, `/en/team`, `/en/results`, `/en/contact` — all should show the new 双岸教育 header and footer.

- [ ] **Step 10: Commit**

```bash
git add src/app/[locale]/(landing)/_components/landing-header.tsx \
       src/app/[locale]/(landing)/_components/landing-footer.tsx \
       src/app/[locale]/(landing)/_components/language-switcher.tsx \
       src/app/[locale]/(landing)/_components/mobile-menu.tsx \
       src/app/[locale]/(landing)/layout.tsx \
       src/app/[locale]/(landing)/page.tsx \
       src/app/[locale]/(landing)/contact/page.tsx \
       src/app/[locale]/(landing)/results/page.tsx \
       src/app/[locale]/(landing)/team/page.tsx \
       src/app/[locale]/(landing)/landing-atlas.css
git commit -m "feat: extract shared header/footer with SAJU branding, language switcher, mobile menu"
```

---

## Task 4: Reusable UI Components

**Files:**
- Create: `src/app/[locale]/(landing)/_components/why-us-accordion.tsx`
- Create: `src/app/[locale]/(landing)/_components/pricing-cards.tsx`
- Create: `src/app/[locale]/(landing)/_components/reviews-carousel.tsx`
- Create: `src/app/[locale]/(landing)/_components/counselor-card.tsx`
- Create: `src/app/[locale]/(landing)/_components/faq-section.tsx`
- Create: `src/app/[locale]/(landing)/_components/case-study-card.tsx`

- [ ] **Step 1: Create why-us-accordion.tsx**

Client component with `variant` prop (`"detailed"` = two-column for College Admissions, `"compact"` = single-column for About Us):

```typescript
'use client';

import { useState } from 'react';
import type { Trait } from '@/lib/landing-data';

interface WhyUsAccordionProps {
  traits: Trait[];
  variant?: 'detailed' | 'compact';
}

export function WhyUsAccordion({ traits, variant = 'detailed' }: WhyUsAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={`why-us-accordion why-us-accordion--${variant}`}>
      {traits.map((trait, i) => (
        <div
          key={i}
          className={`why-us-item ${openIndex === i ? 'why-us-item--open' : ''}`}
        >
          <button
            className="why-us-trigger"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            aria-expanded={openIndex === i}
          >
            <span className="why-us-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="why-us-title">{trait.title}</span>
            <span className="why-us-chevron" aria-hidden="true" />
          </button>
          <div className={`why-us-body ${openIndex === i ? 'why-us-body--open' : ''}`}>
            <p>{trait.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create pricing-cards.tsx**

Server component (no interactivity needed):

```typescript
import { Link } from '@/i18n/routing';
import type { PricingTier } from '@/lib/landing-data';

interface PricingCardsProps {
  tiers: PricingTier[];
}

export function PricingCards({ tiers }: PricingCardsProps) {
  return (
    <div className="pricing-cards">
      {tiers.map((tier) => (
        <article key={tier.name} className={`pricing-card ${tier.popular ? 'pricing-card--popular' : ''}`}>
          {tier.popular && <div className="pricing-badge">Most Popular</div>}
          <span className="pricing-tier">{tier.tier}</span>
          <h3>{tier.name}</h3>
          <ul>
            {tier.features.map((f) => <li key={f}>{f}</li>)}
          </ul>
          <Link href={tier.ctaHref} className={tier.popular ? 'pricing-btn-primary' : 'pricing-btn-outline'}>
            {tier.ctaText}
          </Link>
        </article>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create reviews-carousel.tsx**

Client component with horizontal scroll/carousel:

```typescript
'use client';

import type { Review } from '@/lib/landing-data';

interface ReviewsCarouselProps {
  reviews: Review[];
}

export function ReviewsCarousel({ reviews }: ReviewsCarouselProps) {
  return (
    <div className="reviews-carousel">
      {reviews.map((review, i) => (
        <article key={i} className="review-card">
          <div className="review-stars" aria-label={`${review.rating} stars`}>
            {'★'.repeat(review.rating)}
          </div>
          <p className="review-text">{review.text}</p>
          <footer className="review-meta">
            <strong>{review.name}</strong>
            <span>{review.location} · {review.date}</span>
          </footer>
        </article>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create counselor-card.tsx**

```typescript
import type { CounselorProfile } from '@/lib/landing-data';

interface CounselorCardProps {
  counselor: CounselorProfile;
}

export function CounselorCard({ counselor }: CounselorCardProps) {
  return (
    <article className="counselor-card">
      <div className="counselor-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={counselor.posterImage} alt={counselor.name} className="counselor-poster" loading="lazy" />
        {counselor.videoUrl ? (
          <iframe
            src={counselor.videoUrl}
            title={`Meet ${counselor.name}`}
            className="counselor-video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <div className="counselor-video-placeholder">
            <span className="play-icon">▶</span>
            <span>Video coming soon</span>
          </div>
        )}
      </div>
      <div className="counselor-info">
        <h3>{counselor.name}</h3>
        <p className="counselor-title">{counselor.title}</p>
        <p className="counselor-desc">{counselor.description}</p>
        <div className="counselor-tags">
          {counselor.tags.map((tag) => (
            <span key={tag} className="counselor-tag">{tag}</span>
          ))}
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 5: Create faq-section.tsx**

Reusable FAQ accordion — used on Home, Contact, and potentially College Admissions:

```typescript
'use client';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  heading: string;
  items: FAQItem[];
}

export function FAQSection({ heading, items }: FAQSectionProps) {
  return (
    <section className="faq-section">
      <h2>{heading}</h2>
      <div className="faq-list">
        {items.map((item, i) => (
          <details key={i} className="faq-item">
            <summary>{item.question}</summary>
            <div className="faq-answer">
              <p>{item.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Create case-study-card.tsx**

```typescript
import type { CaseStudy } from '@/lib/landing-data';

interface CaseStudyCardProps {
  study: CaseStudy;
}

export function CaseStudyCard({ study }: CaseStudyCardProps) {
  return (
    <article className="case-study-card">
      <div className="case-study-header">
        <div className="case-study-profile">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={study.photo} alt={study.name} loading="lazy" />
          <h3>{study.name}</h3>
        </div>
        <div className="case-study-badges">
          <span className="badge badge--challenges">Challenges</span>
          <span className="badge badge--result">Result</span>
        </div>
      </div>
      <ul className="case-study-challenges">
        {study.challenges.map((c) => <li key={c}>{c}</li>)}
      </ul>
      <div className="case-study-details">
        <div><strong>Academics:</strong> {study.academics}</div>
        <div><strong>Initial Profile:</strong> {study.initialProfile}</div>
        <div><strong>Extracurriculars:</strong> {study.extracurriculars}</div>
        <div><strong>Changes Made:</strong> {study.changesMade}</div>
        {study.otherInfo && <div><strong>Other:</strong> {study.otherInfo}</div>}
        <div className="case-study-outcome"><strong>Outcome:</strong> {study.outcome}</div>
      </div>
    </article>
  );
}
```

- [ ] **Step 7: Add CSS for all shared components**

Add styles for `.why-us-accordion`, `.pricing-cards`, `.reviews-carousel`, `.counselor-card`, `.faq-section`, `.case-study-card` to `landing-atlas.css`. Follow existing design patterns — serif headings, clean spacing, dark accent sections.

- [ ] **Step 8: Commit**

```bash
git add src/app/[locale]/(landing)/_components/why-us-accordion.tsx \
       src/app/[locale]/(landing)/_components/pricing-cards.tsx \
       src/app/[locale]/(landing)/_components/reviews-carousel.tsx \
       src/app/[locale]/(landing)/_components/counselor-card.tsx \
       src/app/[locale]/(landing)/_components/faq-section.tsx \
       src/app/[locale]/(landing)/_components/case-study-card.tsx \
       src/app/[locale]/(landing)/landing-atlas.css
git commit -m "feat: add reusable landing components — accordion, pricing, reviews, counselor, FAQ, case study"
```

---

## Task 5: Rework Home Page

**Files:**
- Modify: `src/app/[locale]/(landing)/page.tsx`
- Modify: `src/app/[locale]/(landing)/landing-home.css`

- [ ] **Step 1: Update metadata**

Replace title/description with SAJU branding:

```typescript
export const metadata: Metadata = {
  title: 'SAJU 双岸教育 | Strategic University Admissions Counseling',
  description: 'SAJU helps students and families build a defensible admissions strategy — school list architecture, major-fit positioning, essay direction, and budget-aware execution.',
};
```

- [ ] **Step 2: Update hero section**

Replace the two CTA buttons:
- "Start Your Strategy" → "Talk to an Expert" (href `/contact`)
- "See the Process" → "University Match Engine" (href `/neural-engine`)

Update badge text: "Strategic admissions counsel" stays.

- [ ] **Step 3: Add Who We Are section after metrics**

Insert new section after `{/* ─── METRICS ─── */}`:

```tsx
{/* ─── WHO WE ARE ─── */}
<AnimatedSection>
  <section className="h-sect h-who-we-are">
    <div className="h-sect-head">
      <span className="h-kicker">Who We Are</span>
      <h2>The World&apos;s Premier College Consultants</h2>
    </div>
    <p className="h-sect-sub">
      SAJU combines admissions strategists, essay specialists, and student-success
      advisors who deliver structured, data-driven guidance from start to submission.
    </p>
    <Link className="h-btn-outline" href="/counselors">
      Meet Our Counselors
    </Link>
  </section>
</AnimatedSection>
```

- [ ] **Step 4: Add 5th process step**

In the Process section, add a 5th timeline step after "Submission Control":

```tsx
<article className="h-tl-step">
  <div className="h-tl-dot" />
  <span className="h-tl-label">05</span>
  <h3>Phases &amp; Initial Consultation</h3>
  <p>
    Begin with Neural Engine assessment and initial consultation to map your
    personalized phase-by-phase plan.
  </p>
</article>
```

Add "Learn More" button below the timeline:

```tsx
<Link className="h-btn-outline" href="/college-admissions">
  Learn More
</Link>
```

- [ ] **Step 5: Move Neural Engine callout before Outcomes**

Move the `{/* ─── AI ENGINE CALLOUT ─── */}` section from its current position (after Pricing) to right after the Process section and before the Outcomes section.

- [ ] **Step 6: Update Outcomes section**

Change the kicker text from "What Structure Changes" to "Our Impact". Add subheading: "Main student improvements compared to applying by themselves". Change the section class from `h-dark-sect` to a different color variant — update CSS to use a teal/green dark gradient instead of the current dark navy.

- [ ] **Step 7: Add Reviews section after Outcomes**

Insert new section using the ReviewsCarousel component:

```tsx
{/* ─── REVIEWS ─── */}
<AnimatedSection>
  <section className="h-sect">
    <div className="h-sect-head">
      <span className="h-kicker">Testimonials</span>
      <h2>Our students are at the heart of everything we do.</h2>
    </div>
    <ReviewsCarousel reviews={REVIEWS} />
    <Link className="h-btn-outline" href="/results">
      More Details
    </Link>
  </section>
</AnimatedSection>
```

Import `REVIEWS` from `@/lib/landing-data` and `ReviewsCarousel` from `_components`.

- [ ] **Step 8: Replace inline pricing with PricingCards component**

Replace the inline pricing cards with:

```tsx
<PricingCards tiers={PRICING_TIERS} />
```

Import `PRICING_TIERS` from `@/lib/landing-data`.

- [ ] **Step 9: Replace inline FAQ with FAQSection component**

Replace the inline FAQ with:

```tsx
<FAQSection heading="Common questions, direct answers" items={HOME_FAQ} />
```

Import `HOME_FAQ` from `@/lib/landing-data`.

- [ ] **Step 10: Remove the Final CTA section**

The final CTA ("Ready to build yours?") is now redundant with the Programs section having CTAs. Remove it, or keep it as a simpler version. Decision: keep it but update text to reference SAJU.

- [ ] **Step 11: Update landing-home.css for reordered sections**

Update CSS for: new Who We Are section styles, Outcomes section color change (teal/green gradient), Reviews section layout, Neural Engine callout repositioned.

- [ ] **Step 12: Verify Home page renders correctly**

Run dev server, visit `http://localhost:3000/en`. Verify all sections appear in correct order with proper styling.

- [ ] **Step 13: Commit**

```bash
git add "src/app/[locale]/(landing)/page.tsx" "src/app/[locale]/(landing)/landing-home.css"
git commit -m "feat: rework Home page — SAJU branding, new sections, reordered layout"
```

---

## Task 6: College Admissions Page (NEW)

**Files:**
- Create: `src/app/[locale]/(landing)/college-admissions/page.tsx`

- [ ] **Step 1: Create the page**

Build `college-admissions/page.tsx` with all sections from spec §3:
1. Dark hero with image bg + "Book an Initial Consultation" CTA
2. WhyUsAccordion (variant="detailed", two-column)
3. Phases overview (clickable titles that scroll to details)
4. Phase details (5 phases, buttons on 1 and 4)
5. PricingCards component
6. Counselors preview (centered heading, James + Chris cards, "Full Counselor List" button)
7. ReviewsCarousel + "More Details" button → /results

Import all data from `@/lib/landing-data`.

- [ ] **Step 2: Add page-specific CSS**

Add College Admissions page styles to `landing-atlas.css` — dark hero section, phase details layout with image + text side by side, phase nav with scroll-to behavior.

- [ ] **Step 3: Verify the page renders**

Visit `http://localhost:3000/en/college-admissions`. All sections should render.

- [ ] **Step 4: Commit**

```bash
git add "src/app/[locale]/(landing)/college-admissions/page.tsx" \
       "src/app/[locale]/(landing)/landing-atlas.css"
git commit -m "feat: add College Admissions page — Why Us, 5 phases, pricing, counselor preview"
```

---

## Task 7: About Us Page (NEW)

**Files:**
- Create: `src/app/[locale]/(landing)/about/page.tsx`

- [ ] **Step 1: Create the page**

Build `about/page.tsx` with all sections from spec §4:
1. Image-only hero (full-width background, no text overlay)
2. "What Makes the Difference?" — intro + origin story with side image
3. WhyUsAccordion (variant="compact", single-column)
4. Our Leadership — mission statement + 3 team member cards with photos

Import `WHY_US_TRAITS`, `LEADERSHIP` from `@/lib/landing-data`.

- [ ] **Step 2: Add page-specific CSS**

- [ ] **Step 3: Verify and commit**

```bash
git add "src/app/[locale]/(landing)/about/page.tsx" \
       "src/app/[locale]/(landing)/landing-atlas.css"
git commit -m "feat: add About Us page — hero, origin story, Why Us accordion, leadership"
```

---

## Task 8: Counselors Page (Rework /team → /counselors)

**Files:**
- Create: `src/app/[locale]/(landing)/counselors/page.tsx`
- Modify: `src/app/[locale]/(landing)/team/page.tsx` (convert to redirect)

- [ ] **Step 1: Create counselors/page.tsx**

Build page with sections from spec §5:
1. Header section — heading + intro text (NO buttons, NO circular avatars)
2. CounselorCard components for James and Chris
3. Operating Principles section (6 principles)
4. Global Reach (3 regions)
5. CTA — "Book Your Consultation" → /contact

Import `COUNSELORS`, `OPERATING_PRINCIPLES`, `GLOBAL_REGIONS` from `@/lib/landing-data`.

- [ ] **Step 2: Convert team/page.tsx to redirect**

Replace entire `team/page.tsx` with:

```typescript
import { redirect } from 'next/navigation';

export default function TeamRedirect() {
  redirect('/counselors');
}
```

Note: The middleware 301 redirect handles the primary case. This Next.js redirect is a fallback for any edge case where middleware doesn't catch it.

- [ ] **Step 3: Verify and commit**

```bash
git add "src/app/[locale]/(landing)/counselors/page.tsx" \
       "src/app/[locale]/(landing)/team/page.tsx" \
       "src/app/[locale]/(landing)/landing-atlas.css"
git commit -m "feat: add Counselors page, redirect /team → /counselors"
```

---

## Task 9: Results Page (Major Rework)

**Files:**
- Modify: `src/app/[locale]/(landing)/results/page.tsx`

- [ ] **Step 1: Rewrite results/page.tsx**

Rebuild with sections from spec §6:
1. Full-width hero (remove right-side section) — buttons swapped: "Discuss Your Profile" first, then "Run Neural Engine"
2. Case Studies section (4 CaseStudyCards)
3. Before/After "Transformation Pattern" (3 comparisons + common thread text)
4. "Get Your Own Baseline First" (3 steps + "Get Started" button → /neural-engine)
5. REMOVE: disclaimer section and "See Your Own Alternatives" CTA

Import `CASE_STUDIES`, `BEFORE_AFTER` from `@/lib/landing-data`.

- [ ] **Step 2: Update metadata**

```typescript
export const metadata: Metadata = {
  title: 'SAJU Results | Student Outcomes and Case Stories',
  description: 'See how students improve their admissions position with SAJU — case studies, before/after transformations, and measurable outcomes.',
};
```

- [ ] **Step 3: Verify and commit**

```bash
git add "src/app/[locale]/(landing)/results/page.tsx" \
       "src/app/[locale]/(landing)/landing-atlas.css"
git commit -m "feat: rework Results page — full-width hero, case studies, before/after, baseline CTA"
```

---

## Task 10: Prisma Schema + Inquiry API

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/lib/inquiry-schema.ts`
- Create: `src/app/api/inquiries/route.ts`

- [ ] **Step 1: Add InquirySubmission model to Prisma schema**

Append to `prisma/schema.prisma`:

```prisma
model InquirySubmission {
  id                  String   @id @default(cuid())
  studentFullName     String
  parentWeChatId      String?
  parentPhone         String?
  parentEmail         String
  studentSchool       String?
  studentGrade        String?
  graduationYear      String?
  grades              String?
  intendedMajors      String?
  targetCountries     String?
  budgetRange         String?
  supportNeeded       String?
  neuralEngineReport  String?
  notes               String?
  honeypot            String?
  createdAt           DateTime @default(now())

  @@index([createdAt])
}
```

- [ ] **Step 2: Run prisma migration**

```bash
cd /Users/iliazharnikov/Documents/GitHub/admission-atlas
npx prisma migrate dev --name add-inquiry-submission
```

- [ ] **Step 3: Create Zod validation schema**

```typescript
// src/lib/inquiry-schema.ts
import { z } from 'zod';

export const inquirySchema = z.object({
  studentFullName: z.string().min(1, 'Student name is required').max(200),
  parentWeChatId: z.string().max(100).optional().default(''),
  parentPhone: z.string().max(50).optional().default(''),
  parentEmail: z.string().email('Valid email is required').max(200),
  studentSchool: z.string().max(200).optional().default(''),
  studentGrade: z.string().max(50).optional().default(''),
  graduationYear: z.string().max(10).optional().default(''),
  grades: z.string().max(500).optional().default(''),
  intendedMajors: z.string().max(500).optional().default(''),
  targetCountries: z.string().max(500).optional().default(''),
  budgetRange: z.string().max(100).optional().default(''),
  supportNeeded: z.string().max(100).optional().default(''),
  neuralEngineReport: z.string().url().optional().or(z.literal('')).default(''),
  notes: z.string().max(2000).optional().default(''),
  honeypot: z.string().max(0, 'Bot detected').optional().default(''),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
```

- [ ] **Step 4: Create API route**

```typescript
// src/app/api/inquiries/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { inquirySchema } from '@/lib/inquiry-schema';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = inquirySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Honeypot check — if filled, silently succeed (don't reveal to bot)
    if (parsed.data.honeypot) {
      return NextResponse.json({ success: true, message: 'Your responses have been submitted successfully. Check your email for next steps.' });
    }

    const { honeypot, ...data } = parsed.data;

    await prisma.inquirySubmission.create({
      data: {
        studentFullName: data.studentFullName,
        parentWeChatId: data.parentWeChatId || null,
        parentPhone: data.parentPhone || null,
        parentEmail: data.parentEmail,
        studentSchool: data.studentSchool || null,
        studentGrade: data.studentGrade || null,
        graduationYear: data.graduationYear || null,
        grades: data.grades || null,
        intendedMajors: data.intendedMajors || null,
        targetCountries: data.targetCountries || null,
        budgetRange: data.budgetRange || null,
        supportNeeded: data.supportNeeded || null,
        neuralEngineReport: data.neuralEngineReport || null,
        notes: data.notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Your responses have been submitted successfully. Check your email for next steps.',
    });
  } catch (error) {
    console.error('Inquiry submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit inquiry. Please try again.' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma src/lib/inquiry-schema.ts src/app/api/inquiries/route.ts
git commit -m "feat: add InquirySubmission model, Zod schema, and public API route"
```

---

## Task 11: Contact Page (Major Rework)

**Files:**
- Modify: `src/app/[locale]/(landing)/contact/page.tsx`

- [ ] **Step 1: Rewrite contact/page.tsx**

Rebuild with sections from spec §7:
1. Full-width hero — "Book a Strategy Consultation with SAJU" (remove right side section, remove right button)
2. Centered inquiry form with 14 fields (text inputs, dropdowns, file upload, textarea)
   - Hidden honeypot field
   - Budget Range dropdown options: "Under $10,000", "$10,000–$20,000", "$20,000–$30,000", "$30,000–$40,000", "$40,000+", "Flexible"
   - Support Needed dropdown: "Strategy Build", "Full Guidance", "Premium Mentorship", "Other"
   - File upload: client-side Vercel Blob upload, then submit URL
   - On submit: POST to `/api/inquiries`, show confirmation message
3. FAQSection with CONTACT_FAQ data
4. Contact Channels section below form

This page needs a client component for the form (file upload + state management). Structure:
- `contact/page.tsx` — server component with metadata + layout
- Import a `ContactForm` client component for the interactive form

- [ ] **Step 2: Create ContactForm client component**

Create `src/app/[locale]/(landing)/contact/_components/contact-form.tsx` — handles form state, file upload to Vercel Blob, POST to `/api/inquiries`, success/error states.

- [ ] **Step 3: Add file upload route for Vercel Blob**

Create `src/app/api/upload/route.ts` using `@vercel/blob`'s `handleUpload` for client uploads. This is a thin wrapper that generates upload tokens.

- [ ] **Step 4: Update metadata**

```typescript
export const metadata: Metadata = {
  title: 'Contact SAJU | Book a Strategy Consultation',
  description: 'Book a strategy consultation with SAJU. Share your admissions context for personalized guidance.',
};
```

- [ ] **Step 5: Verify form submission works**

Visit `/en/contact`, fill out the form, submit. Check DB for new `InquirySubmission` record.

- [ ] **Step 6: Commit**

```bash
git add "src/app/[locale]/(landing)/contact/page.tsx" \
       "src/app/[locale]/(landing)/contact/_components/contact-form.tsx" \
       src/app/api/upload/route.ts \
       "src/app/[locale]/(landing)/landing-atlas.css"
git commit -m "feat: rework Contact page — 14-field inquiry form with file upload, honeypot, DB save"
```

---

## Task 12: Neural Engine Port

**Files:**
- Create: `src/app/[locale]/(landing)/neural-engine/page.tsx`
- Create: `src/app/api/neural-engine/route.ts`
- Create: `src/lib/neural-engine-rate-limit.ts`

**Reference:** Port from `/Users/iliazharnikov/Documents/GitHub/admission-atlas-landing/` — `server.js` (lines 59-225), `lib/prompts.js` (90 lines), `public/index.html` (228 lines).

- [ ] **Step 1: Create dedicated rate limiter**

```typescript
// src/lib/neural-engine-rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : undefined;

const neuralEngineLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '60 s'),
      analytics: true,
      prefix: 'saju:neural-engine',
    })
  : null;

// In-memory fallback
const memoryMap = new Map<string, { count: number; start: number }>();

export async function isNeuralEngineRateLimited(ip: string): Promise<boolean> {
  if (neuralEngineLimiter) {
    try {
      const { success } = await neuralEngineLimiter.limit(ip);
      return !success;
    } catch {
      // Fall through to in-memory
    }
  }
  const now = Date.now();
  const entry = memoryMap.get(ip);
  if (!entry || now - entry.start >= 60_000) {
    memoryMap.set(ip, { count: 1, start: now });
    return false;
  }
  entry.count++;
  return entry.count > 10;
}
```

- [ ] **Step 2: Create API route handler**

Port the Express `/analyze` endpoint to `src/app/api/neural-engine/route.ts`:
- Public (no requireAuth)
- Use the dedicated rate limiter
- Copy prompt logic from `admission-atlas-landing/lib/prompts.js`
- Use OpenAI GPT-4o-mini
- Return JSON with match %, scores, alternatives, next steps

- [ ] **Step 3: Create Neural Engine page**

Rebuild `public/index.html` (228 lines) as a React client component at `src/app/[locale]/(landing)/neural-engine/page.tsx`:
- Form with fields: student profile, grades, major, location, budget, target school
- Submit → POST to `/api/neural-engine`
- Display results: match %, category scores, strengths, concerns, alternatives
- Loading state, error handling

- [ ] **Step 4: Verify Neural Engine works end-to-end**

Visit `/en/neural-engine`, fill out the form, submit. Should return AI analysis results (requires `OPENAI_API_KEY` in `.env`).

- [ ] **Step 5: Commit**

```bash
git add src/lib/neural-engine-rate-limit.ts \
       src/app/api/neural-engine/route.ts \
       "src/app/[locale]/(landing)/neural-engine/page.tsx" \
       "src/app/[locale]/(landing)/landing-atlas.css"
git commit -m "feat: port Neural Engine — public API with dedicated rate limiter, React UI"
```

---

## Task 13: i18n — Landing Namespace

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/zh.json`

- [ ] **Step 1: Add landing namespace to en.json**

Add a `"landing"` key to `messages/en.json` with all strings used in shared components (header nav labels, footer text, common button labels). Page-specific strings remain hardcoded for now — this is the Phase 1 incremental approach.

```json
{
  "landing": {
    "nav": {
      "aboutUs": "About Us",
      "collegeAdmissions": "College Admissions",
      "counselors": "Counselors",
      "results": "Results",
      "contact": "Contact",
      "portal": "SAJU Portal",
      "engine": "SAJU Engine",
      "bookCall": "Book a Call",
      "login": "Log in"
    },
    "footer": {
      "tagline": "Strategic admissions counsel.",
      "contact": "Contact",
      "followUs": "Follow Us"
    },
    "langSwitch": {
      "label": "Switch language"
    }
  }
}
```

- [ ] **Step 2: Add empty landing namespace to zh.json**

Same structure with Chinese translations:

```json
{
  "landing": {
    "nav": {
      "aboutUs": "关于我们",
      "collegeAdmissions": "大学申请",
      "counselors": "顾问团队",
      "results": "成果展示",
      "contact": "联系我们",
      "portal": "SAJU门户",
      "engine": "SAJU引擎",
      "bookCall": "预约咨询",
      "login": "登录"
    },
    "footer": {
      "tagline": "专业升学战略咨询。",
      "contact": "联系方式",
      "followUs": "关注我们"
    },
    "langSwitch": {
      "label": "切换语言"
    }
  }
}
```

- [ ] **Step 3: Update LandingHeader and LandingFooter to use translations**

In `landing-header.tsx`, add `useTranslations('landing')` and replace hardcoded nav labels with `t('nav.aboutUs')`, etc.

In `landing-footer.tsx`, use `getTranslations('landing')` (server component) for footer text.

- [ ] **Step 4: Verify language switching works**

Visit `/en`, click language switcher → should navigate to `/zh` with Chinese nav/footer text.

- [ ] **Step 5: Commit**

```bash
git add messages/en.json messages/zh.json \
       "src/app/[locale]/(landing)/_components/landing-header.tsx" \
       "src/app/[locale]/(landing)/_components/landing-footer.tsx"
git commit -m "feat: add i18n landing namespace — EN/ZH header and footer translations"
```

---

## Task 14: Final Polish + Branding Sweep

**Files:**
- All landing page files

- [ ] **Step 1: Global branding sweep**

Search all landing page files for "Admission Atlas" and replace with "SAJU" or "双岸教育" as appropriate:
- Page titles/metadata → "SAJU"
- Visible UI text → "SAJU" or "双岸教育"
- Code comments can keep "Admission Atlas" for historical context

```bash
grep -r "Admission Atlas" src/app/[locale]/(landing)/ --include="*.tsx" -l
```

- [ ] **Step 2: Verify all pages render and navigate correctly**

Manual check of all 7 pages:
1. `/en` — Home
2. `/en/about` — About Us
3. `/en/college-admissions` — College Admissions
4. `/en/counselors` — Counselors
5. `/en/results` — Results
6. `/en/contact` — Contact (test form submission)
7. `/en/neural-engine` — Neural Engine
8. `/en/team` → should redirect to `/en/counselors`
9. `/zh` — should show Chinese header/footer

- [ ] **Step 3: Verify middleware works**

Test scenarios:
- Unauthenticated user can visit all landing pages
- Authenticated user can ALSO visit landing pages (not redirected to dashboard)
- Authenticated user on `/login` IS redirected to dashboard
- `/team` redirects to `/counselors` with 301

- [ ] **Step 4: Commit final polish**

```bash
git add -A
git commit -m "feat: complete SAJU website redesign — branding sweep, final polish"
```
