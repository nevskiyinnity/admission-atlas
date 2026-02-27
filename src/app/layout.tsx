import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

// Since we have a `[locale]` dynamic segment, you might think
// a root layout file is unnecessary. However, the root layout
// is still required in the app router — this pass-through
// prevents Next.js from auto-generating one with <html>/<body>
// that would conflict with [locale]/layout.tsx.
export default function RootLayout({ children }: Props) {
  return children;
}
