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
