import type { Metadata } from 'next';
import { Bodoni_Moda, Manrope } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider'; // Assuming you have a theme provider, if not, remove this wrapper

// 1. Configure Manrope (Body)
const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

// 2. Configure Bodoni Moda (Headings)
const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-bodoni',
  display: 'swap',
  // Variable fonts support italics by default
});

export const metadata: Metadata = {
  title: 'Currly - The Honest AI Tools Discovery Platform',
  description: 'Discover the best AI tools without affiliate bias.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 3. Inject variables into the HTML tag
    <html lang="en" className={`${manrope.variable} ${bodoni.variable} scroll-smooth`}>
      <body className="font-sans antialiased bg-[#F5F5F7] dark:bg-black text-gray-900 dark:text-white selection:bg-[#0066FF] selection:text-white">
        {/* Remove ThemeProvider if you aren't using next-themes yet, otherwise keep it */}
        {children}
      </body>
    </html>
  );
}