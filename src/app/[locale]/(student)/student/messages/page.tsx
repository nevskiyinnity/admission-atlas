'use client';

import { useTranslations } from 'next-intl';
import { MessageSquare } from 'lucide-react';

export default function StudentMessagesPage() {
  const t = useTranslations('student.messages');

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <MessageSquare className="h-12 w-12 mb-4" />
        <p className="text-sm">Messages are available within each project task view.</p>
        <p className="text-sm">Navigate to a project to start messaging your counselor.</p>
      </div>
    </div>
  );
}
