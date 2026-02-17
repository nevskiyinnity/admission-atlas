'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface LoginLogEntry {
  id: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

const tabKeys = ['info', 'password', 'loginHistory'] as const;

export default function StudentAccountPage() {
  const t = useTranslations('account');
  const tc = useTranslations('common');
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<string>('info');
  const [user, setUser] = useState<any>(null);
  const [loginLogs, setLoginLogs] = useState<LoginLogEntry[]>([]);
  const [passwordForm, setPasswordForm] = useState({ code: '', newPassword: '', confirmPassword: '' });
  const [codeSent, setCodeSent] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/users/${session.user.id}`).then((r) => r.json()).then(setUser);
      fetch(`/api/login-logs?userId=${session.user.id}`).then((r) => r.json()).then(setLoginLogs);
    }
  }, [session?.user?.id]);

  const sendCode = () => setCodeSent(true);
  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return;
    await fetch(`/api/users/${session?.user?.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passwordForm.newPassword }),
    });
    setPasswordForm({ code: '', newPassword: '', confirmPassword: '' });
  };

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
          <div className="flex gap-2 items-end">
            <div className="flex-1"><Label>{t('password.verificationCode')}</Label><Input value={passwordForm.code} onChange={(e) => setPasswordForm({ ...passwordForm, code: e.target.value })} /></div>
            <Button variant="outline" size="sm" onClick={sendCode} disabled={codeSent}>{t('password.sendCode')}</Button>
          </div>
          <div><Label>{t('password.newPassword')}</Label><Input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} /></div>
          <div><Label>{t('password.confirmPassword')}</Label><Input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} /></div>
          <Button onClick={changePassword}>{t('password.confirmChange')}</Button>
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
