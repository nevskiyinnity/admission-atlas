import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import '@/app/globals.css';
import { AuthProvider } from '@/components/providers/auth-provider';
import { TawkToWidget } from '@/components/shared/tawk-to-widget';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Admission Atlas',
  description: 'University Admissions Full Process Integrated System',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <AuthProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
            <TawkToWidget />
          </NextIntlClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
