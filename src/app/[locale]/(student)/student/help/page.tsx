'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronRight, Phone, Mail, MessageCircle } from 'lucide-react';

interface FAQ { id: string; question: string; answer: string; category: string; }

export default function StudentHelpPage() {
  const t = useTranslations('help');
  const tc = useTranslations('common');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/faq').then((r) => r.json()).then(setFaqs);
  }, []);

  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t('faq')}</h2>
        {categories.map((cat) => (
          <div key={cat} className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground uppercase">{cat}</h3>
            {faqs.filter((f) => f.category === cat).map((faq) => (
              <div key={faq.id} className="border rounded-lg">
                <button
                  className="w-full text-left p-3 flex items-center justify-between text-sm font-medium"
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                >
                  {faq.question}
                  {openId === faq.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                {openId === faq.id && (
                  <div className="px-3 pb-3 text-sm text-muted-foreground">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        ))}
        {faqs.length === 0 && <p className="text-muted-foreground">{tc('noData')}</p>}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">{t('contact')}</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4" /><span>{t('contactPhone')}: +86 400-123-4567</span></div>
          <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4" /><span>{t('contactEmail')}: support@admissionatlas.com</span></div>
          <div className="flex items-center gap-2 text-sm"><MessageCircle className="h-4 w-4" /><span>{t('contactWeChat')}: AdmissionAtlas</span></div>
        </div>
      </div>
    </div>
  );
}
