import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { getLocale, getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from './language-switcher';
import { MobileMenu } from './mobile-menu';

export async function LandingHeader() {
  const [locale, t] = await Promise.all([getLocale(), getTranslations('landing')]);

  return (
    <header className="l-header">
      <div className="l-header-inner">
        <Link className="l-brand" href="/" aria-label="双岸教育 SAJU">
          {locale === 'zh' ? (
            <Image
              src="/images/logo-zh.svg"
              alt=""
              width={200}
              height={60}
              priority
              className="l-brand-logo"
            />
          ) : (
            <span className="l-brand-placeholder" aria-hidden="true" />
          )}
        </Link>
        <nav className="l-nav-links">
          <Link href="/about">{t('nav.aboutUs')}</Link>
          <Link href="/college-admissions">{t('nav.collegeAdmissions')}</Link>
          <Link href="/counselors">{t('nav.counselors')}</Link>
          <Link href="/results">{t('nav.results')}</Link>
          <Link href="/contact">{t('nav.contact')}</Link>
          <Link href="/login">{t('nav.portal')}</Link>
        </nav>
        <div className="l-nav-right">
          <LanguageSwitcher />
          <Link href="/neural-engine" className="l-btn-ghost">
            {t('nav.engine')}
          </Link>
          <Link href="/contact" className="l-btn-primary">
            {t('nav.bookCall')}
          </Link>
        </div>
        <MobileMenu />
      </div>
    </header>
  );
}
