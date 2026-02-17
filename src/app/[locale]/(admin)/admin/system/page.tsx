'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQ { id: string; question: string; answer: string; category: string; }
interface FeedbackType { id: string; name: string; }
interface Announcement { id: string; title: string; content: string; target: string; createdAt: string; }

const sectionKeys = ['faqManagement', 'feedbackTypes', 'announcements'] as const;

export default function SystemPage() {
  const t = useTranslations('admin.system');
  const tc = useTranslations('common');

  const [activeSection, setActiveSection] = useState<string>('faqManagement');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [feedbackTypes, setFeedbackTypes] = useState<FeedbackType[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: '' });
  const [typeInput, setTypeInput] = useState('');
  const [annForm, setAnnForm] = useState({ title: '', content: '', target: 'ALL' });
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [showAnnForm, setShowAnnForm] = useState(false);

  useEffect(() => {
    fetch('/api/faq').then((r) => r.json()).then(setFaqs);
    fetch('/api/feedback-types').then((r) => r.json()).then(setFeedbackTypes);
    fetch('/api/announcements').then((r) => r.json()).then(setAnnouncements);
  }, []);

  const addFaq = async () => {
    if (!faqForm.question || !faqForm.answer || !faqForm.category) return;
    await fetch('/api/faq', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(faqForm) });
    setFaqForm({ question: '', answer: '', category: '' });
    setShowFaqForm(false);
    const res = await fetch('/api/faq'); setFaqs(await res.json());
  };

  const deleteFaq = async (id: string) => {
    await fetch(`/api/faq/${id}`, { method: 'DELETE' });
    setFaqs(faqs.filter((f) => f.id !== id));
  };

  const addType = async () => {
    if (!typeInput.trim()) return;
    await fetch('/api/feedback-types', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: typeInput.trim() }) });
    setTypeInput('');
    const res = await fetch('/api/feedback-types'); setFeedbackTypes(await res.json());
  };

  const deleteType = async (id: string) => {
    await fetch(`/api/feedback-types?id=${id}`, { method: 'DELETE' });
    setFeedbackTypes(feedbackTypes.filter((ft) => ft.id !== id));
  };

  const addAnnouncement = async () => {
    if (!annForm.title || !annForm.content) return;
    await fetch('/api/announcements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(annForm) });
    setAnnForm({ title: '', content: '', target: 'ALL' });
    setShowAnnForm(false);
    const res = await fetch('/api/announcements'); setAnnouncements(await res.json());
  };

  const deleteAnnouncement = async (id: string) => {
    await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
    setAnnouncements(announcements.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <div className="flex gap-2 border-b pb-2">
        {sectionKeys.map((key) => (
          <button key={key} className={cn('px-3 py-1.5 rounded-md text-sm font-medium', activeSection === key ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')} onClick={() => setActiveSection(key)}>
            {t(key)}
          </button>
        ))}
      </div>

      {activeSection === 'faqManagement' && (
        <div className="space-y-3">
          <Button size="sm" onClick={() => setShowFaqForm(true)}><Plus className="h-3 w-3 mr-1" />{t('addFaq')}</Button>
          {showFaqForm && (
            <div className="border rounded-lg p-4 space-y-3 max-w-md">
              <div><Label>{t('question')}</Label><Input value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} /></div>
              <div><Label>{t('answer')}</Label><textarea className="w-full border rounded px-3 py-2 text-sm min-h-[80px]" value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} /></div>
              <div><Label>{t('category')}</Label><Input value={faqForm.category} onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })} /></div>
              <div className="flex gap-2">
                <Button size="sm" onClick={addFaq}>{tc('confirm')}</Button>
                <Button size="sm" variant="outline" onClick={() => setShowFaqForm(false)}>{tc('cancel')}</Button>
              </div>
            </div>
          )}
          {faqs.map((faq) => (
            <div key={faq.id} className="border rounded-lg p-3 flex items-start justify-between">
              <div>
                <Badge variant="outline" className="mb-1">{faq.category}</Badge>
                <p className="font-medium text-sm">{faq.question}</p>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
              <button onClick={() => deleteFaq(faq.id)}><Trash2 className="h-4 w-4 text-red-500" /></button>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'feedbackTypes' && (
        <div className="space-y-3 max-w-md">
          <div className="flex gap-2">
            <Input placeholder={t('typeName')} value={typeInput} onChange={(e) => setTypeInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addType()} />
            <Button size="sm" onClick={addType}><Plus className="h-3 w-3 mr-1" />{t('addType')}</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {feedbackTypes.map((ft) => (
              <Badge key={ft.id} variant="secondary" className="gap-1 pr-1">
                {ft.name}
                <button onClick={() => deleteType(ft.id)}><X className="h-3 w-3" /></button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'announcements' && (
        <div className="space-y-3">
          <Button size="sm" onClick={() => setShowAnnForm(true)}><Plus className="h-3 w-3 mr-1" />{t('addAnnouncement')}</Button>
          {showAnnForm && (
            <div className="border rounded-lg p-4 space-y-3 max-w-md">
              <div><Label>{t('announcementTitle')}</Label><Input value={annForm.title} onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })} /></div>
              <div><Label>{t('announcementContent')}</Label><textarea className="w-full border rounded px-3 py-2 text-sm min-h-[80px]" value={annForm.content} onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })} /></div>
              <div>
                <Label>{t('target')}</Label>
                <select className="w-full border rounded px-3 py-2 text-sm mt-1" value={annForm.target} onChange={(e) => setAnnForm({ ...annForm, target: e.target.value })}>
                  <option value="ALL">{t('targetAll')}</option>
                  <option value="STUDENTS">{t('targetStudents')}</option>
                  <option value="COUNSELORS">{t('targetCounselors')}</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={addAnnouncement}>{tc('confirm')}</Button>
                <Button size="sm" variant="outline" onClick={() => setShowAnnForm(false)}>{tc('cancel')}</Button>
              </div>
            </div>
          )}
          {announcements.map((ann) => (
            <div key={ann.id} className="border rounded-lg p-3 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{ann.title}</span>
                  <Badge variant="outline">{ann.target}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{ann.content}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('createdAt')}: {new Date(ann.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => deleteAnnouncement(ann.id)}><Trash2 className="h-4 w-4 text-red-500" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
