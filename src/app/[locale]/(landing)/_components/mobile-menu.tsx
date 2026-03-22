'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';

const NAV_LINKS = [
  { href: '/about', label: 'About Us' },
  { href: '/college-admissions', label: 'College Admissions' },
  { href: '/counselors', label: 'Counselors' },
  { href: '/results', label: 'Results' },
  { href: '/contact', label: 'Contact' },
  { href: '/login', label: 'SAJU Portal' },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="mobile-menu-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        <span className={`hamburger ${open ? 'hamburger--open' : ''}`} />
      </button>
      {open && (
        <div className="mobile-menu-overlay" onClick={() => setOpen(false)}>
          <nav className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href="/neural-engine" className="mobile-menu-cta" onClick={() => setOpen(false)}>
              SAJU Engine
            </Link>
            <Link href="/contact" className="mobile-menu-cta mobile-menu-cta--primary" onClick={() => setOpen(false)}>
              Book a Call
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
