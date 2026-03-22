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
