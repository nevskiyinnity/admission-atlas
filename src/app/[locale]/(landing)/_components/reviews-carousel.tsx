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
