import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from './language-switcher';
import { MobileMenu } from './mobile-menu';

export async function LandingHeader() {
  const t = await getTranslations('landing');

  return (
    <header className="l-header">
      <div className="l-header-inner">
        <Link className="l-brand" href="/" aria-label="双岸教育 SAJU">
          <Image
            src="/images/logo.svg"
            alt=""
            width={222}
            height={52}
            priority
            className="l-brand-logo"
          />
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
