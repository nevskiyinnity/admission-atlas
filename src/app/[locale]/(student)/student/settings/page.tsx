'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

export default function StudentSettingsPage() {
  const t = useTranslations('settings');
  const tc = useTranslations('common');
  const { data: session } = useSession();
  const [settings, setSettings] = useState({ webNotifications: true, smsNotifications: true, emailNotifications: true });

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/users/${session.user.id}`).then((r) => r.json()).then((u) => {
        setSettings({ webNotifications: u.webNotifications, smsNotifications: u.smsNotifications, emailNotifications: u.emailNotifications });
      });
    }
  }, [session?.user?.id]);

  const toggle = async (key: keyof typeof settings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    await fetch(`/api/users/${session?.user?.id}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <div className="max-w-md space-y-4">
        {(['webNotifications', 'smsNotifications', 'emailNotifications'] as const).map((key) => (
          <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium text-sm">{t(key)}</h3>
              <p className="text-xs text-muted-foreground">{t(`${key}Desc`)}</p>
            </div>
            <button
              onClick={() => toggle(key)}
              className={`w-11 h-6 rounded-full relative transition-colors ${settings[key] ? 'bg-primary' : 'bg-muted'}`}
            >
              <span className={`block w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform ${settings[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
