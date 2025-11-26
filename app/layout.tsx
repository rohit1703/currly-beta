import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://currly-beta.vercel.app'), // Change to your real domain later
  title: {
    default: 'Currly - The World\'s First AI Tools Discovery Engine',
    template: '%s | Currly', // This ensures pages look like "About | Currly"
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#F5F5F7] dark:bg-black text-gray-900 dark:text-white selection:bg-[#0066FF] selection:text-white`}>
        {/* Wrap children in the ThemeProvider */}
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
        </ThemeProvider>
      </body>
    </html>
  );
}