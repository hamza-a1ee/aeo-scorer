import type { Metadata } from 'next';
import { Fira_Code, Geist } from 'next/font/google';

import { Providers } from '@/providers';

import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const firaCode = Fira_Code({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-fira-code',
});

export const metadata: Metadata = {
  title: 'AEO App · Find out what AI answer engines say about your app',
  description:
    'Paste one URL. We crawl your site, ask the AI answer engines your buyer questions, check every answer against your own pages, and hand back a score with the fixes drafted.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${firaCode.variable}`}
    >
      <body className="min-h-dvh w-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
