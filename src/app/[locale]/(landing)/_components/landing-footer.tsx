import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="h-foot">
      <div className="h-foot-inner">
        <div className="h-foot-left">
          <span className="h-foot-brand">Admission Atlas</span>
          <span className="h-foot-tag">
            Strategic admissions counsel.
          </span>
        </div>
        <nav className="h-foot-links">
          <Link href="/team">Team</Link>
          <Link href="/results">Results</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/login">Log in</Link>
        </nav>
      </div>
    </footer>
  );
}
