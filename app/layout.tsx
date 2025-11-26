import type { Metadata } from 'next';
import { Bodoni_Moda, Manrope } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { CSPostHogProvider } from '@/components/posthog-provider';
import PostHogPageView from '@/components/PostHogPageView';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-bodoni',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://currly-beta.vercel.app'),
  title: {
    default: 'Currly - The World\'s First AI Tools Discovery Engine',
    template: '%s | Currly',
  },
  description: 'Discover 700+ AI tools curated by experts. No affiliate bias, just honest reviews.',
  keywords: ['AI tools', 'SaaS', 'software discovery', 'artificial intelligence', 'tech stack'],
  authors: [{ name: 'Rohit Bangaram' }, { name: 'Ashish Singh' }],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://currly-beta.vercel.app',
    title: 'Currly - Honest AI Discovery',
    description: 'Stop searching. Start building. 700+ AI tools curated by experts.',
    siteName: 'Currly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Currly - Honest AI Discovery',
    description: 'Stop searching. Start building. 700+ AI tools curated by experts.',
    creator: '@currly',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${bodoni.variable} scroll-smooth`} suppressHydrationWarning>
      <CSPostHogProvider>
        <body className="font-sans antialiased bg-[#F5F5F7] dark:bg-black text-gray-900 dark:text-white selection:bg-[#0066FF] selection:text-white">
          <PostHogPageView />
          <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
          </ThemeProvider>
        </body>
      </CSPostHogProvider>
    </html>
  );
}