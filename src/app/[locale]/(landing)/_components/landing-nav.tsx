'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function LandingNav() {
  const pathname = usePathname();

  // Strip locale prefix to get the page path
  const pagePath = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';
  const isHome = pagePath === '/' || pagePath === '';

  return (
    <header className="h-nav">
      <div className="h-nav-inner">
        <Link className="h-brand" href="/">
          <span className="h-brand-mark" aria-hidden="true" />
          Admission Atlas
        </Link>

        <nav className="h-nav-links">
          {isHome ? (
            <>
              <a href="#services">Services</a>
              <a href="#process">Process</a>
              <a href="#outcomes">Outcomes</a>
              <Link href="/team">Team</Link>
            </>
          ) : (
            <>
              <Link href="/">Home</Link>
              <Link href="/team" className={pagePath === '/team' ? 'active' : ''}>
                Team
              </Link>
              <Link href="/results" className={pagePath === '/results' ? 'active' : ''}>
                Results
              </Link>
              <Link href="/contact" className={pagePath === '/contact' ? 'active' : ''}>
                Contact
              </Link>
            </>
          )}
        </nav>

        <div className="h-nav-right">
          <Link href="/login" className="h-nav-login">
            Log in
          </Link>
          <Link href="/contact" className="h-nav-cta">
            Book a Call
          </Link>
        </div>
      </div>
    </header>
  );
}
