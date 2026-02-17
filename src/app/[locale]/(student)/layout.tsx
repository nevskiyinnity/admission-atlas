'use client';

import { useTranslations } from 'next-intl';
import {
  BarChart3,
  MessageSquare,
  Bell,
  User,
  Settings,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';
import { PortalLayout } from '@/components/layout/portal-layout';
import { SidebarItem } from '@/components/layout/sidebar';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('student.sidebar');

  const sidebarItems: SidebarItem[] = [
    { label: t('progressTracking'), href: '/student/dashboard', icon: <BarChart3 className="h-4 w-4" /> },
    { label: t('messages'), href: '/student/messages', icon: <MessageSquare className="h-4 w-4" /> },
    { label: t('notifications'), href: '/student/notifications', icon: <Bell className="h-4 w-4" /> },
    { label: t('account'), href: '/student/account', icon: <User className="h-4 w-4" /> },
    { label: t('settings'), href: '/student/settings', icon: <Settings className="h-4 w-4" /> },
    { label: t('feedback'), href: '/student/feedback', icon: <MessageCircle className="h-4 w-4" /> },
    { label: t('help'), href: '/student/help', icon: <HelpCircle className="h-4 w-4" /> },
  ];

  return <PortalLayout sidebarItems={sidebarItems}>{children}</PortalLayout>;
}
