'use client';

import { useTranslations } from 'next-intl';
import { PortalLayout } from '@/components/layout/portal-layout';
import {
  Users,
  Bell,
  User,
  Settings,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';

export default function CounselorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('counselor.sidebar');

  const sidebarItems = [
    {
      label: t('students'),
      href: '/counselor/students',
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: t('notifications'),
      href: '/counselor/notifications',
      icon: <Bell className="h-4 w-4" />,
    },
    {
      label: t('account'),
      href: '/counselor/account',
      icon: <User className="h-4 w-4" />,
    },
    {
      label: t('settings'),
      href: '/counselor/settings',
      icon: <Settings className="h-4 w-4" />,
    },
    {
      label: t('feedback'),
      href: '/counselor/feedback',
      icon: <MessageCircle className="h-4 w-4" />,
    },
    {
      label: t('help'),
      href: '/counselor/help',
      icon: <HelpCircle className="h-4 w-4" />,
    },
  ];

  return <PortalLayout sidebarItems={sidebarItems}>{children}</PortalLayout>;
}
