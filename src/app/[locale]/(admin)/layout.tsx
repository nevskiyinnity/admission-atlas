'use client';

import { useTranslations } from 'next-intl';
import { PortalLayout } from '@/components/layout/portal-layout';
import { SidebarItem } from '@/components/layout/sidebar';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Tag,
  FolderOpen,
  CheckSquare,
  MessageSquare,
  FileText,
  LogIn,
  Upload,
  Settings,
  MessageCircle,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('admin.sidebar');

  const sidebarItems: SidebarItem[] = [
    {
      label: t('dashboard'),
      href: '/admin/dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: t('students'),
      href: '/admin/students',
      icon: <GraduationCap className="h-4 w-4" />,
    },
    {
      label: t('teachers'),
      href: '/admin/teachers',
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: t('tags'),
      href: '/admin/tags',
      icon: <Tag className="h-4 w-4" />,
    },
    {
      label: t('applications'),
      href: '/admin/applications',
      icon: <FolderOpen className="h-4 w-4" />,
    },
    {
      label: t('tasks'),
      href: '/admin/tasks',
      icon: <CheckSquare className="h-4 w-4" />,
    },
    {
      label: t('communications'),
      href: '/admin/communications',
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      label: t('files'),
      href: '/admin/files',
      icon: <FileText className="h-4 w-4" />,
    },
    {
      label: t('loginLogs'),
      href: '/admin/logs/login',
      icon: <LogIn className="h-4 w-4" />,
    },
    {
      label: t('uploadLogs'),
      href: '/admin/logs/upload',
      icon: <Upload className="h-4 w-4" />,
    },
    {
      label: t('system'),
      href: '/admin/system',
      icon: <Settings className="h-4 w-4" />,
    },
    {
      label: t('feedback'),
      href: '/admin/feedback',
      icon: <MessageCircle className="h-4 w-4" />,
    },
  ];

  return <PortalLayout sidebarItems={sidebarItems}>{children}</PortalLayout>;
}
