'use client';

import { useTranslations } from 'next-intl';
import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './language-switcher';
import { UserMenu } from './user-menu';
import { Badge } from '@/components/ui/badge';

interface TopBarProps {
  onMenuClick?: () => void;
  notificationCount?: number;
}

export function TopBar({ onMenuClick, notificationCount = 0 }: TopBarProps) {
  const t = useTranslations('common');

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <LanguageSwitcher />

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {notificationCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
              {notificationCount}
            </Badge>
          )}
        </Button>

        <UserMenu />
      </div>
    </header>
  );
}
