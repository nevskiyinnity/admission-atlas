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
