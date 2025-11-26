import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Currly - The Honest AI Tools Discovery Platform",
  description: "Discover the best AI tools without affiliate bias.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#F5F5F7] dark:bg-black text-gray-900 dark:text-white selection:bg-[#0066FF] selection:text-white`}>
        {children}
      </body>
    </html>
  );
}