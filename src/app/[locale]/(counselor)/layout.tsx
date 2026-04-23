'use client';

import { useTranslations } from 'next-intl';
import { PortalLayout } from '@/components/layout/portal-layout';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Bell,
  Settings,
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
      label: t('dashboard'),
      href: '/counselor/dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: t('studentManagement'),
      href: '/counselor/students',
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: t('tasks'),
      href: '/counselor/tasks',
      icon: <CheckSquare className="h-4 w-4" />,
    },
    {
      label: t('notifications'),
      href: '/counselor/notifications',
      icon: <Bell className="h-4 w-4" />,
    },
    {
      label: t('settingsAccount'),
      href: '/counselor/account',
      icon: <Settings className="h-4 w-4" />,
    },
    {
      label: t('help'),
      href: '/counselor/help',
      icon: <HelpCircle className="h-4 w-4" />,
    },
  ];

  return <PortalLayout sidebarItems={sidebarItems}>{children}</PortalLayout>;
}
