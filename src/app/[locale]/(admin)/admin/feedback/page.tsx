'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface FeedbackReply { id: string; content: string; createdAt: string; user: { name: string; role: string }; }
interface FeedbackItem {
  id: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
  user: { name: string; role: string };
  replies: FeedbackReply[];
}

export default function AdminFeedbackPage() {
  const t = useTranslations('admin.feedback');
  const tc = useTranslations('common');
  const { data: session } = useSession();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchFeedbacks = async () => {
    const res = await fetch('/api/feedback');
    setFeedbacks(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchFeedbacks(); }, []);

  const sendReply = async (feedbackId: string) => {
    const text = replyText[feedbackId]?.trim();
    if (!text || !session?.user?.id) return;
    await fetch(`/api/feedback/${feedbackId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text, userId: session.user.id }),
    });
    setReplyText({ ...replyText, [feedbackId]: '' });
    fetchFeedbacks();
  };

  const statusVariant = (s: string) => s === 'REPLIED' ? 'success' as const : s === 'CLOSED' ? 'secondary' as const : 'warning' as const;
  const statusLabel = (s: string) => s === 'REPLIED' ? t('replied') : s === 'CLOSED' ? t('closed') : t('pending');

  if (loading) return <p className="text-muted-foreground">{tc('loading')}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      {feedbacks.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">{t('noFeedback')}</p>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-sm">{fb.user.name}</span>
                  <span className="text-xs text-muted-foreground">({fb.user.role})</span>
                  <Badge variant="outline">{fb.type}</Badge>
                </div>
                <Badge variant={statusVariant(fb.status)}>{statusLabel(fb.status)}</Badge>
              </div>
              <p className="text-sm">{fb.description}</p>
              <p className="text-xs text-muted-foreground">{t('submittedAt')}: {new Date(fb.createdAt).toLocaleString()}</p>

              <button className="text-xs text-primary underline" onClick={() => setExpandedId(expandedId === fb.id ? null : fb.id)}>
                {t('reply')} ({fb.replies.length})
              </button>

              {expandedId === fb.id && (
                <div className="pl-4 border-l-2 space-y-2 mt-2">
                  {fb.replies.map((r) => (
                    <div key={r.id}>
                      <p className="text-xs text-muted-foreground">{r.user.name} ({r.user.role}) - {new Date(r.createdAt).toLocaleString()}</p>
                      <p className="text-sm">{r.content}</p>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder={t('replyPlaceholder')}
                      value={replyText[fb.id] || ''}
                      onChange={(e) => setReplyText({ ...replyText, [fb.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && sendReply(fb.id)}
                    />
                    <Button size="sm" onClick={() => sendReply(fb.id)}>{t('sendReply')}</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
