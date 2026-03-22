import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SAJU Neural Match Engine | Free University Matching Tool',
  description:
    'Input your profile, target school, and budget. Our AI scores your fit and suggests alternatives worldwide — instant, no sign-up.',
};

export default function NeuralEngineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
