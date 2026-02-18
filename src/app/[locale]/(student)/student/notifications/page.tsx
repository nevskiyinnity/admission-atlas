'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Megaphone, MessageSquare, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

const tabs = ['ALL', 'ANNOUNCEMENT', 'MESSAGE', 'FEEDBACK'] as const;

export default function StudentNotificationsPage() {
  const t = useTranslations('notifications');
  const tc = useTranslations('common');
  const { userId } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!userId) return;
    const params = new URLSearchParams({ userId: userId });
    if (activeTab !== 'ALL') params.set('type', activeTab);
    const res = await fetch(`/api/notifications?${params}`);
    setNotifications(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, [userId, activeTab]);

  const markAllRead = async () => {
    if (!userId) return;
    await fetch('/api/notifications/mark-all-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userId }),
    });
    fetchNotifications();
  };

  const typeIcon = (type: string) => {
    if (type === 'ANNOUNCEMENT') return <Megaphone className="h-4 w-4 text-blue-500" />;
    if (type === 'MESSAGE') return <MessageSquare className="h-4 w-4 text-green-500" />;
    if (type === 'FEEDBACK') return <HelpCircle className="h-4 w-4 text-orange-500" />;
    return <Bell className="h-4 w-4 text-muted-foreground" />;
  };

  const tabLabels: Record<string, string> = {
    ALL: t('tabs.all'),
    ANNOUNCEMENT: t('tabs.announcements'),
    MESSAGE: t('tabs.messages'),
    FEEDBACK: t('tabs.feedback'),
  };

  if (loading) return <p className="text-muted-foreground">{tc('loading')}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Button variant="outline" size="sm" onClick={markAllRead}>{tc('markAllRead')}</Button>
      </div>

      <div className="flex gap-2 border-b pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={cn('px-3 py-1.5 rounded-md text-sm font-medium', activeTab === tab ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}
            onClick={() => setActiveTab(tab)}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">{tc('noData')}</p>
        ) : notifications.map((n) => (
          <div key={n.id} className={cn('p-4 border rounded-lg flex gap-3', !n.isRead && 'bg-primary/5 border-primary/20')}>
            <div className="mt-0.5">{typeIcon(n.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={cn('font-medium text-sm', !n.isRead && 'font-semibold')}>{n.title}</h3>
                {!n.isRead && <Badge variant="secondary" className="text-[10px]">{tc('unread')}</Badge>}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{n.content}</p>
              <p className="text-xs text-muted-foreground mt-2">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
