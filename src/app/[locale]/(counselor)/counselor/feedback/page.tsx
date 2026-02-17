'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface FeedbackType { id: string; name: string; }
interface FeedbackReply { id: string; content: string; createdAt: string; user: { name: string; role: string }; }
interface FeedbackItem { id: string; type: string; description: string; status: string; createdAt: string; replies: FeedbackReply[]; }

export default function CounselorFeedbackPage() {
  const t = useTranslations('feedback');
  const tc = useTranslations('common');
  const { data: session } = useSession();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [types, setTypes] = useState<FeedbackType[]>([]);
  const [form, setForm] = useState({ type: '', description: '' });
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetch('/api/feedback-types').then((r) => r.json()).then(setTypes);
    if (session?.user?.id) {
      fetch(`/api/feedback?userId=${session.user.id}`).then((r) => r.json()).then(setFeedbacks);
    }
  }, [session?.user?.id]);

  const submitFeedback = async () => {
    if (!form.type || !form.description || !session?.user?.id) return;
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, userId: session.user.id }),
    });
    setForm({ type: '', description: '' });
    const res = await fetch(`/api/feedback?userId=${session.user.id}`);
    setFeedbacks(await res.json());
  };

  const statusVariant = (s: string) => s === 'REPLIED' ? 'success' as const : s === 'CLOSED' ? 'secondary' as const : 'warning' as const;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      {!showHistory ? (
        <div className="max-w-md space-y-4">
          <div>
            <Label>{t('issueType')}</Label>
            <select className="w-full border rounded px-3 py-2 text-sm mt-1" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="">--</option>
              {types.map((ft) => <option key={ft.id} value={ft.name}>{ft.name}</option>)}
            </select>
          </div>
          <div>
            <Label>{t('description')}</Label>
            <textarea className="w-full border rounded px-3 py-2 text-sm mt-1 min-h-[100px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <Button onClick={submitFeedback}>{t('sendFeedback')}</Button>
            <Button variant="outline" onClick={() => setShowHistory(true)}>{t('viewHistory')}</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Button variant="outline" size="sm" onClick={() => setShowHistory(false)}>{tc('back')}</Button>
          <h2 className="font-semibold">{t('history.title')}</h2>
          {feedbacks.length === 0 ? (
            <p className="text-muted-foreground">{tc('noData')}</p>
          ) : feedbacks.map((fb) => (
            <div key={fb.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{fb.type}</span>
                <Badge variant={statusVariant(fb.status)}>{fb.status}</Badge>
              </div>
              <p className="text-sm">{fb.description}</p>
              <p className="text-xs text-muted-foreground">{t('history.submissionTime')}: {new Date(fb.createdAt).toLocaleString()}</p>
              {fb.replies.length > 0 && (
                <div className="pl-4 border-l-2 space-y-2 mt-2">
                  {fb.replies.map((r) => (
                    <div key={r.id}>
                      <p className="text-xs text-muted-foreground">{r.user.name} ({r.user.role})</p>
                      <p className="text-sm">{r.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
