import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google'; // CHANGED FONT
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import MobileNav from '@/components/MobileNav';

const font = Plus_Jakarta_Sans({ subsets: ['latin'] }); // CHANGED FONT

export const metadata: Metadata = {
  title: 'Currly - AI Discovery Engine',
  description: 'Don’t just find AI. Adopt it.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={font.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light" // Default to Light to match "Apple" vibe
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  );
}