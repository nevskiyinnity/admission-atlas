'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useDbUser } from '@/hooks/use-db-user';

interface LoginLogEntry {
  id: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface FeedbackType { id: string; name: string; }
interface FeedbackReply { id: string; content: string; createdAt: string; user: { name: string; role: string }; }
interface FeedbackItem { id: string; type: string; description: string; status: string; createdAt: string; replies: FeedbackReply[]; }

const tabKeys = ['info', 'password', 'settings', 'feedback', 'loginHistory'] as const;

export default function StudentAccountPage() {
  const t = useTranslations('account');
  const tc = useTranslations('common');
  const dbUser = useDbUser();
  const [activeTab, setActiveTab] = useState<string>('info');
  const [user, setUser] = useState<any>(null);
  const [loginLogs, setLoginLogs] = useState<LoginLogEntry[]>([]);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notifSettings, setNotifSettings] = useState({ webNotifications: true, smsNotifications: true, emailNotifications: true });
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [feedbackTypes, setFeedbackTypes] = useState<FeedbackType[]>([]);
  const [feedbackForm, setFeedbackForm] = useState({ type: '', description: '' });

  useEffect(() => {
    if (!dbUser?.id) return;
    fetch(`/api/users/${dbUser.id}`)
      .then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then((u) => {
        setUser(u);
        setNotifSettings({ webNotifications: u.webNotifications ?? true, smsNotifications: u.smsNotifications ?? true, emailNotifications: u.emailNotifications ?? true });
      })
      .catch((e) => setError(`Failed to load profile (${e.message})`));
    fetch(`/api/login-logs?userId=${dbUser.id}`)
      .then((r) => r.ok ? r.json() : [])
      .then(setLoginLogs)
      .catch(() => {});
    fetch('/api/feedback-types').then((r) => r.ok ? r.json() : []).then(setFeedbackTypes).catch(() => {});
    fetch(`/api/feedback?userId=${dbUser.id}`)
      .then((r) => r.ok ? r.json() : { feedbacks: [] })
      .then((d) => setFeedbacks(d.feedbacks ?? []))
      .catch(() => {});
  }, [dbUser?.id]);

  const toggleNotif = async (key: keyof typeof notifSettings) => {
    if (!dbUser?.id) return;
    const updated = { ...notifSettings, [key]: !notifSettings[key] };
    setNotifSettings(updated);
    await fetch(`/api/users/${dbUser.id}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  };

  const submitFeedback = async () => {
    if (!feedbackForm.type || !feedbackForm.description || !dbUser?.id) return;
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: feedbackForm.type, description: feedbackForm.description }),
    });
    if (res.ok) {
      setFeedbackForm({ type: '', description: '' });
      const fbRes = await fetch(`/api/feedback?userId=${dbUser.id}`);
      if (fbRes.ok) { const d = await fbRes.json(); setFeedbacks(d.feedbacks ?? []); }
    }
  };

  const changePassword = async () => {
    setPasswordMsg(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg(t('password.mismatch'));
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordMsg(t('password.tooShort'));
      return;
    }
    const res = await fetch(`/api/users/${dbUser?.id}/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword: passwordForm.newPassword }),
    });
    if (res.ok) {
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      setPasswordMsg(t('password.success'));
    } else {
      setPasswordMsg(t('password.failed'));
    }
  };

  if (error) return <p className="text-destructive">{error}</p>;
  if (!user) return <p className="text-muted-foreground">{tc('loading')}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <div className="flex gap-2 border-b pb-2">
        {tabKeys.map((tab) => (
          <button key={tab} className={cn('px-3 py-1.5 rounded-md text-sm font-medium', activeTab === tab ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')} onClick={() => setActiveTab(tab)}>
            {t(`tabs.${tab}`)}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <div className="max-w-md space-y-4">
          <div><Label>{t('info.name')}</Label><p className="text-sm mt-1">{user.name}</p></div>
          <div><Label>{t('info.email')}</Label><p className="text-sm mt-1">{user.email}</p></div>
          <div><Label>{t('info.gender')}</Label><p className="text-sm mt-1">{user.gender || '-'}</p></div>
          <div><Label>{t('info.phone')}</Label><p className="text-sm mt-1">{user.phone || '-'}</p></div>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="max-w-md space-y-4">
          <div><Label>{t('password.currentEmail')}</Label><p className="text-sm mt-1">{user.email}</p></div>
          <div><Label>{t('password.newPassword')}</Label><Input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} /></div>
          <div><Label>{t('password.confirmPassword')}</Label><Input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} /></div>
          {passwordMsg && <p className="text-sm text-muted-foreground">{passwordMsg}</p>}
          <Button onClick={changePassword}>{t('password.confirmChange')}</Button>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-md space-y-4">
          {(['webNotifications', 'smsNotifications', 'emailNotifications'] as const).map((key) => (
            <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium text-sm">{t(`settings.${key}`)}</h3>
                <p className="text-xs text-muted-foreground">{t(`settings.${key}Desc`)}</p>
              </div>
              <button
                onClick={() => toggleNotif(key)}
                className={`w-11 h-6 rounded-full relative transition-colors ${notifSettings[key] ? 'bg-primary' : 'bg-muted'}`}
              >
                <span className={`block w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform ${notifSettings[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="max-w-lg space-y-4">
          <div className="space-y-4 border rounded-lg p-4">
            <div>
              <Label>{t('feedback.issueType')}</Label>
              <select className="w-full border rounded px-3 py-2 text-sm mt-1" value={feedbackForm.type} onChange={(e) => setFeedbackForm({ ...feedbackForm, type: e.target.value })}>
                <option value="">--</option>
                {feedbackTypes.map((ft) => <option key={ft.id} value={ft.name}>{ft.name}</option>)}
              </select>
            </div>
            <div>
              <Label>{t('feedback.description')}</Label>
              <textarea className="w-full border rounded px-3 py-2 text-sm mt-1 min-h-[80px]" value={feedbackForm.description} onChange={(e) => setFeedbackForm({ ...feedbackForm, description: e.target.value })} />
            </div>
            <Button onClick={submitFeedback} size="sm">{t('feedback.send')}</Button>
          </div>
          {feedbacks.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">{t('feedback.history')}</h3>
              {feedbacks.map((fb) => (
                <div key={fb.id} className="border rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{fb.type}</span>
                    <Badge variant={fb.status === 'REPLIED' ? 'success' : 'secondary'} className="text-xs">{fb.status}</Badge>
                  </div>
                  <p className="text-sm">{fb.description}</p>
                  <p className="text-xs text-muted-foreground">{new Date(fb.createdAt).toLocaleString()}</p>
                  {fb.replies.length > 0 && (
                    <div className="pl-3 border-l-2 space-y-1 mt-2">
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
      )}

      {activeTab === 'loginHistory' && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">{t('loginHistory.ip')}</th>
                <th className="text-left p-3 font-medium">{t('loginHistory.device')}</th>
                <th className="text-left p-3 font-medium">{t('loginHistory.time')}</th>
              </tr>
            </thead>
            <tbody>
              {loginLogs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="p-3">{log.ip || '-'}</td>
                  <td className="p-3 max-w-[300px] truncate">{log.userAgent || '-'}</td>
                  <td className="p-3">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
