import { DM_Serif_Display, Manrope, Space_Grotesk } from 'next/font/google';
import './landing-home.css';
import './landing-atlas.css';

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

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`landing-scope ${dmSerif.variable} ${manrope.variable} ${spaceGrotesk.variable}`}
    >
      {children}
    </div>
  );
}
