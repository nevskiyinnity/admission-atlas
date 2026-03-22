import {
  DM_Serif_Display,
  Manrope,
  Space_Grotesk,
  Instrument_Serif,
  Plus_Jakarta_Sans,
} from 'next/font/google';
import './landing-atlas.css';
import './landing-home.css';
import './landing-animations.css';
import { LandingHeader } from './_components/landing-header';
import { LandingFooter } from './_components/landing-footer';

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-serif',
});

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`landing-scope ${dmSerif.variable} ${manrope.variable} ${spaceGrotesk.variable} ${instrumentSerif.variable} ${jakartaSans.variable}`}
    >
      <noscript>
        <style>{`
          .landing-scope .shell > *,
          .landing-scope [class*="sect"],
          .landing-scope [class*="hero"] > * {
            opacity: 1 !important;
            transform: none !important;
          }
        `}</style>
      </noscript>
      <LandingHeader />
      {children}
      <LandingFooter />
    </div>
  );
}
