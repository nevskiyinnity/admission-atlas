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
