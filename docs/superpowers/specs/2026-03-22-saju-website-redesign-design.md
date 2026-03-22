# SAJU Website Redesign — Design Spec

**Date:** 2026-03-22
**Repo:** `admission-atlas` (branch: `main`)
**Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma, Clerk, next-intl (en/zh), GSAP + Lenis animations

## Decisions

- **Branding:** Full rebrand from "Admission Atlas" to "双岸教育 / SAJU" everywhere
- **Neural Engine:** Port from `admission-atlas-landing` repo into this repo
- **Email automation:** Deferred — contact form saves to DB only for now
- **Approach:** Incremental page-by-page — rework shared layout first, then each page

---

## 1. Architecture & Shared Components

### Shared Layout (`(landing)/layout.tsx`)

Extract header and footer from `page.tsx` into dedicated components used across all landing pages.

### Header (`LandingHeader`)

- Logo: 双岸教育 (links to `/`)
- Nav links: About Us (`/about`), College Admissions (`/college-admissions`), Counselors (`/counselors`), Results (`/results`), Contact (`/contact`), SAJU Portal (links to `/login` or dashboard)
- Right side: "SAJU Engine" button (ghost/light → `/neural-engine`) + "Book a Call" button (filled/dark → `/contact`)
- Language switcher: EN/ZH toggle (uses existing `next-intl`)
- Mobile: hamburger menu

### Footer (`LandingFooter`)

- Brand: 双岸教育
- Contact info: email (info@shuanganjiayu.com), tel, WeChat Official Account ID, XiaoHongShu ID, address (No.6 Haidian Zhongjie, Haidian District, Beijing 100080 PRC), hours (Mon–Fri 9am–6pm ET)
- Social links: **WeChat + XiaoHongShu only**
- Nav links: Team, Results, Contact, Login

### i18n

- All hardcoded English strings move to `messages/en.json` and `messages/zh.json`
- Language switcher component toggles locale in URL path (`/en/...` ↔ `/zh/...`)

### Pages

| Route | Status | Description |
|---|---|---|
| `/` | Rework | Home page |
| `/about` | NEW | About Us |
| `/college-admissions` | NEW | College Admissions detail |
| `/counselors` | Rework (was `/team`) | Counselors page |
| `/results` | Major rework | Results / Case Stories |
| `/contact` | Major rework | Contact + inquiry form |
| `/neural-engine` | NEW (ported) | Neural Match Engine |

---

## 2. Home Page (`/`)

Sections in order:

### 2.1 Hero
- Headline: "Admissions strategy built to *hold up*"
- Two CTA buttons: "Talk to an Expert" (→ `/contact`) + "University Match Engine" (→ `/neural-engine`)
- Keep existing animated orbs/decorative elements

### 2.2 Who We Are (NEW)
- Small intro section — brief company description
- "Meet Our Counselors" button → `/counselors`

### 2.3 Services
- Heading: "Full-spectrum strategy — not disconnected advice"
- 6 cards (keep existing bento grid): School List Architecture, Major-Fit Positioning, Narrative Strategy, Execution Management, Budget & Aid, Family Decisions
- Add missing services noted in feedback: CV, essays, interview prep

### 2.4 Process
- Heading: "Diagnostic to submission"
- **5 steps** (add 5th: "Phases + Initial consultation/NN")
- "Learn More" button → `/college-admissions`

### 2.5 Neural Match Engine (moved from lower position)
- Free tool callout
- "Launch the Engine →" button → `/neural-engine`

### 2.6 Outcomes
- Heading: "When the process is rigorous"
- 4 cards: Sharper School Lists, Stronger Major-Fit Signal, Cleaner Execution, Higher Decision Confidence
- **Change section color** (different tone from current dark theme)
- Reframe as "OUR IMPACT — Main student improvements compared to applying by themselves"

### 2.7 Reviews
- Heading: "Our students are at the heart of everything we do."
- Manual testimonials (not Trustpilot), hardcoded data
- "More Details" button → `/results`

### 2.8 Programs
- Heading: "Matched to your timeline"
- 3 tiers: Strategy Build (Foundation) / Full Guidance (Comprehensive, Most Popular) / Premium Mentorship (Intensive)
- Packages: Initial consultation, Full Bundle, Phase-by-phase (purchase as you go)

### 2.9 FAQ
- Heading: "Common questions, direct answers"
- 4 questions (keep existing accordion):
  1. Do you support students applying outside the US?
  2. When is the best time to start?
  3. Is affordability factored into your recommendations?
  4. What makes this different from other college counselors?

---

## 3. College Admissions Page (`/college-admissions`) — NEW

### 3.1 Hero
- Dark bg with decorative image (NO video)
- Headline: "College Admissions Counseling for 8th-12th Grade Students"
- "Book an Initial Consultation" button → `/contact`

### 3.2 Why Us
- Heading: "Why Choose SAJU Admissions Counseling?"
- 8 traits in two-column accordion (click to expand short description):
  1. Customized counselor assignment + holistic and personalized strategy
  2. Better organization through our own platform
  3. Insider knowledge from our European counselor network
  4. Commitment to prioritizing student fit and transparency
  5. Peer Review Feedback
  6. Bi-weekly Feedback Meetings with Parents
  7. Assistance with Passion Project Development (for student to stand out)
  8. Relocation Assistance

### 3.3 Phases Overview
- Clickable phase titles (scroll/jump to phase detail below)
- General introduction: bi-weekly feedback meetings, application peer review, Neural Engine + Initial consultation, option for full bundle or separate phases
- 5 phase title anchors

### 3.4 Phase Details
- 5 phases, each with: image + description + traits
- Phase 1 and Phase 4: two buttons — "Book an Initial Consultation" + "University Match Engine"
- Other phases: no buttons

### 3.5 Programs
- Same 3-tier pricing component as Home page

### 3.6 Counselors Preview
- Heading: "Meet Some of Our Expert College Admissions Counselors" (centered, NO button next to title)
- Counselor cards: James & Chris with embedded video + short description + tags
- "Full Counselor List" button → `/counselors`

### 3.7 Reviews
- Same manual testimonials component as Home
- "More Details" button → `/results`

---

## 4. About Us Page (`/about`) — NEW

### 4.1 Hero
- Normal image/background (NO video, NO logo)

### 4.2 "What Makes the Difference?"
- General intro + origin story from the perspective of someone who has been in the applicant position many times
- Image alongside text

### 4.3 Why Us (variant)
- Same 8 traits accordion as College Admissions page
- **Different layout and slightly different copy** to avoid being identical

### 4.4 Our Leadership
- Mission statement: "At SAJU, our leadership team is united by the mission of..."
- 3 team members with photos:
  - Jamie B. — CEO/Co-founder
  - Fangzhou J. — Co-founder & Product Officer
  - Arkesh P. — Chief Operating Officer

---

## 5. Counselors Page (`/counselors`) — Rework of `/team`

### 5.1 Header Section
- Heading: "The People Behind Your Admissions Strategy"
- Intro text
- **REMOVE** the 2 top buttons (Book / Meet Us)
- **REMOVE** the 4 circular team avatars

### 5.2 Counselor Cards
- Each counselor: embedded video + short description + tags (e.g., "Essays", "Story Design", "Supplements", "STEM Strategy", "US & Canada")
- Video play button overlay on photo
- Current counselors: James, Chris

### 5.3 Operating Principles
- Heading: "Operating principles that shape every engagement"
- Items: Clarity First, Evidence Over Guesswork, Budget Integrity, Execution Discipline, Global Perspective, Student Ownership

### 5.4 Global Reach
- Heading: "Where we support students"
- 3 regions: US/North America, GB/Europe & UK, SG/Asia-Pacific
- Include counselor expertise info (Oxbridge, other main systems)

### 5.5 CTA
- "Meet the team through a strategy session"
- "Book Your Consultation" button → `/contact`

---

## 6. Results Page (`/results`) — Major Rework

### 6.1 Hero
- Heading: "How Students Improve Their Admissions Position with SAJU"
- **Full-width** (remove right-side image/section)
- Buttons (swapped order): "Discuss Your Profile" (→ `/contact`) + "Run Neural Engine" (→ `/neural-engine`)

### 6.2 Case Studies
- **4 case studies**, each with:
  - Name, Photo
  - Challenges badge, Result badge, Uni Logo
  - Academics section
  - Student Initial Profile
  - Extracurricular Activities
  - Changes Made Through Counseling
  - Other Information
  - Outcome

### 6.3 Before/After — "Transformation Pattern"
- **3 before/after comparisons**
- Common thread: "What they all had in common (and how we fixed it): 1. Unclear academic direction, 2. Weak profile (narrative/CV), 3. Confusion due to scattered/varying info"

### 6.4 Get Your Own Baseline First
- 3 steps: Run Neural Engine → Review Result Gaps → Build Action Plan
- "Get Started" button → `/neural-engine`
- Messaging: "YOUR TURN: 1. Run NN, 2. Schedule initial consultation, 3. Begin your application journey"

### 6.5 Sections to REMOVE
- Disclaimer section at bottom
- "See Your Own Alternatives" CTA section at bottom

---

## 7. Contact Page (`/contact`) — Major Rework

### 7.1 Hero
- Heading: "Book a Strategy Consultation with SAJU"
- **Full-width** (remove right-side section)
- **Remove right button** (keep only "Submit Inquiry")

### 7.2 Inquiry Form
- Heading: "Share Your Admissions Context"
- **Centered layout**, not full-width, with margins on sides
- **Remove** the Contact Channels sidebar from beside the form
- **14 fields:**
  1. Student Full Name (text)
  2. Parent WeChat ID (text)
  3. Parent Phone Number (tel)
  4. Parent Email (email)
  5. Student Current School (text)
  6. Student Current Grade (text)
  7. Expected High School Graduation Year (text/number)
  8. Grades — SAT/ACT, A Levels, IB, etc. (text)
  9. Intended Major(s) (text)
  10. Target Countries/Universities (text)
  11. Budget Range (drop-down select)
  12. Support Needed (drop-down — options include "Other" instead of "Premium Intensive Mentorship")
  13. Upload Neural Engine Report (file upload)
  14. What else would you like us to know? (textarea)
- On submit: confirmation message ("your responses have been submitted successfully, check your email for next steps")
- Data saved to database (email automation deferred to later)

### 7.3 FAQ — "Before You Book"
- Can you work with us if we are early in high school?
- Do we need to know our final university list before reaching out?
- Can you help with scholarship-focused planning?

### 7.4 Contact Channels (own section, below form)
- Email: info@shuanganjiayu.com
- Tel: XXXXXXXXXXX
- WeChat Official Account ID: XXXXXXXXX
- XiaoHongShu ID: XXXXXXXXX
- Address: No.6 Haidian Zhongjie, Haidian District, Beijing 100080 PRC
- Hours: Monday–Friday | 9am–6pm ET

---

## 8. Neural Engine Page (`/neural-engine`) — Ported from `admission-atlas-landing`

Port the Neural Match Engine from the `admission-atlas-landing` repo into this Next.js app:

- Rebuild the static HTML UI as a React component
- Port the Express `/analyze` API endpoint as a Next.js Route Handler (`app/api/neural-engine/route.ts`)
- Keep the OpenAI GPT-4o-mini integration for analysis
- Keep the rate limiting (10 req/min per IP)
- Keep the existing form fields: student profile, grades, major, location, budget, target school
- Output: match %, category scores, strengths/concerns, alternatives, next steps

---

## Data Model

### Contact Form Submissions

New Prisma model for inquiry form data:

```
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
  neuralEngineReport  String?  // Vercel Blob URL
  notes               String?
  createdAt           DateTime @default(now())
}
```

### Reviews/Testimonials

Hardcoded data for now (no DB model needed). Can be moved to DB later.

### Case Studies

Hardcoded data for now. Structure per case study:
- name, photo, challenges[], result, uniLogo
- academics, initialProfile, extracurriculars
- changesMade, otherInfo, outcome
