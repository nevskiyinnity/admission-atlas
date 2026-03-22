'use client';

import { useRouter, usePathname } from '@/i18n/routing';
import { useLocale } from 'next-intl';

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const toggleLocale = () => {
    const newLocale = locale === 'en' ? 'zh' : 'en';
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <button
      onClick={toggleLocale}
      className="lang-switch"
      aria-label={`Switch to ${locale === 'en' ? '中文' : 'English'}`}
    >
      <span className="lang-switch-icon">🌐</span>
      {locale === 'en' ? '中文' : 'EN'}
    </button>
  );
}
