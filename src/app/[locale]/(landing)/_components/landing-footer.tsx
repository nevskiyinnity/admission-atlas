import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';

export async function LandingFooter() {
  const t = await getTranslations('landing');

  return (
    <footer className="l-footer">
      <div className="l-footer-inner">
        <div className="l-footer-brand">
          <span className="l-footer-logo">双岸教育</span>
          <span className="l-footer-tagline">{t('footer.tagline')}</span>
        </div>
        <div className="l-footer-contact">
          <h4>{t('footer.contact')}</h4>
          <p>Email: info@shuanganjiayu.com</p>
          <p>Tel: XXXXXXXXXXX</p>
          <p>WeChat: XXXXXXXXX</p>
          <p>XiaoHongShu: XXXXXXXXX</p>
          <p>No.6 Haidian Zhongjie, Haidian District, Beijing 100080 PRC</p>
          <p>Monday–Friday | 9am–6pm ET</p>
        </div>
        <div className="l-footer-social">
          <h4>{t('footer.followUs')}</h4>
          {/* WeChat and XiaoHongShu icons — placeholder links */}
          <a href="#" aria-label="WeChat">WeChat</a>
          <a href="#" aria-label="XiaoHongShu">XiaoHongShu</a>
        </div>
        <nav className="l-footer-nav">
          <Link href="/counselors">{t('nav.counselors')}</Link>
          <Link href="/results">{t('nav.results')}</Link>
          <Link href="/contact">{t('nav.contact')}</Link>
          <Link href="/login">{t('nav.login')}</Link>
        </nav>
      </div>
    </footer>
  );
}
