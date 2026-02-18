'use client';

import { SignIn } from '@clerk/nextjs';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Globe } from 'lucide-react';

export default function LoginPage() {
  const locale = useLocale();
  const switchLocale = locale === 'en' ? 'zh' : 'en';

  return (
    <div className="w-full max-w-md px-4">
      <div className="flex justify-end mb-4">
        <Link
          href="/login"
          locale={switchLocale}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <Globe className="h-4 w-4" />
          {switchLocale === 'zh' ? '中文' : 'English'}
        </Link>
      </div>

      <SignIn />
    </div>
  );
}
