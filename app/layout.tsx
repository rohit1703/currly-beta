import type { Metadata } from 'next';
import { Bodoni_Moda, Manrope } from 'next/font/google';
import './globals.css';

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
    <html lang="en" className={`${manrope.variable} ${bodoni.variable} scroll-smooth`}>
      <body className="font-sans antialiased bg-[#F5F5F7] dark:bg-black text-gray-900 dark:text-white selection:bg-[#0066FF] selection:text-white">
        {children}
      </body>
    </html>
  );
}