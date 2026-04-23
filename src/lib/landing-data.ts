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
  { title: 'Insider Knowledge from Global Network', description: 'Direct insights from our counselor network across US, UK, European, and Asia-Pacific admissions systems.' },
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
  {
    name: 'Dominic S.',
    photo: '/images/cases/placeholder.svg',
    uniLogo: '/images/unis/placeholder.png',
    challenges: [
      'Perfect grades, no clear academic direction',
      'Every future decision — university, essays, activities — resting on unstable ground',
    ],
    result: 'TU Delft & University of Amsterdam — Industrial Engineering',
    academics: 'IB 40/45 predicted · top of class in Math and Physics · international school in Shanghai',
    initialProfile: 'Strong academics with no answer to the simplest question — "what do you actually want to study?". Direction was missing, not ability.',
    extracurriculars: 'Engaged across technical subjects, but with no strategic thread tying them to a major.',
    changesMade: 'Mapped genuine interests (Industrial Engineering vs. Business Management); evaluated each path across market demand, academic fit, and flexibility; connected Dominic with working professionals in both fields so the choice was grounded in real-world understanding.',
    otherInfo: '',
    outcome: 'Committed to Industrial Engineering with genuine clarity; secured offers from TU Delft and the University of Amsterdam.',
  },
  {
    name: 'Paul K.',
    photo: '/images/cases/placeholder.svg',
    uniLogo: '/images/unis/placeholder.png',
    challenges: [
      'Strong but interchangeable — nothing that made him stand out',
      'A scattered list of activities with no unifying theme',
    ],
    result: 'London School of Economics — with scholarship opportunities',
    academics: 'IB 43/45 predicted · consistently strong across subjects',
    initialProfile: '"Excellent, but so is everyone else applying to competitive universities." A high-performing student with no distinguishing intellectual identity.',
    extracurriculars: 'A wide range of activities accumulated without direction or strategy.',
    changesMade: 'Identified behavioral economics as a central intellectual interest and rebuilt the profile around it; reframed existing experiences to support that narrative; launched a focused project — a social media account explaining real-world economic behavior to a younger audience.',
    otherInfo: '',
    outcome: 'Received an offer from the London School of Economics with strong scholarship opportunities.',
  },
  {
    name: 'Bink M.',
    photo: '/images/cases/placeholder.svg',
    uniLogo: '/images/unis/placeholder.png',
    challenges: [
      'Family fixated on Oxford as the only acceptable outcome',
      'No balanced list, no backup; budget required financial aid that was never guaranteed',
    ],
    result: 'Sciences Po & University of Amsterdam — fit, not just prestige',
    academics: 'A-Level student with high predicted grades in Economics and History',
    initialProfile: 'All-in on a single target with no margin for error and no consideration of program-level fit.',
    extracurriculars: 'Competitive profile for Oxford but not meaningfully differentiated.',
    changesMade: 'Compared programs across the US, UK, and Europe by teaching style, program strengths, career outcomes, and cost; connected the family with current students and alumni to ground the decision in real experience; built a balanced list that kept Oxford alongside strong alternatives.',
    otherInfo: 'Not admitted to Oxford — and that became a successful cycle, not a failed one.',
    outcome: 'Offers from Sciences Po and the University of Amsterdam — both outstanding programs aligned with his interests and long-term goals.',
  },
  {
    name: 'Kexin P.',
    photo: '/images/cases/placeholder.svg',
    uniLogo: '/images/unis/placeholder.png',
    challenges: [
      'Passive student — delayed decisions, missed opportunities',
      'Overwhelmed parents managing the process themselves, with prior distrust of counseling agencies',
    ],
    result: 'ESADE — Bachelor in Business and Artificial Intelligence',
    academics: 'Spanish Baccalaureate · consistently ranked at the very top of her program',
    initialProfile: 'Strong academics and an international upbringing; already helping run the family business — well-positioned for competitive business programs, but not doing the consistent work to translate potential into results.',
    extracurriculars: 'Co-managed the family business alongside her studies.',
    changesMade: 'Mapped every university, requirement, and deadline transparently on our platform so Kexin could see what was done, in progress, and coming next; replaced ad-hoc parental oversight with periodic progress updates focused on decisions, not day-to-day management.',
    otherInfo: 'Originally from Zhejiang; raised in Spain.',
    outcome: 'Admitted to ESADE University for the Bachelor in Business and Artificial Intelligence.',
  },
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
