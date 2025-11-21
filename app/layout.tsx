import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import MobileNav from '@/components/MobileNav'; // <--- IMPORT THIS

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <MobileNav /> {/* <--- ADD THIS HERE */}
        </ThemeProvider>
      </body>
    </html>
  );
}