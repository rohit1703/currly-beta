import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Twitter, Linkedin, Github, Mail } from 'lucide-react';

const footerLinks = {
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Community', href: '/community' },
    { label: 'Contact', href: 'mailto:founders@currly.ai' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-[#111] border-t border-gray-100 dark:border-white/10 pt-16 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 lg:gap-24">
          
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <Logo />
            </Link>
            <p className="mb-8 text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs">
              Your AI-powered compass for discovering and comparing the best SaaS tools. Making software decisions simpler.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <Github className="h-4 w-4" />
              </a>
              <a href="mailto:hello@currly.ai" className="p-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-6 font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs">{category}</h3>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <p>© 2025 Currly. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Discover</span>
            <span className="text-red-500">&</span>
            <span>build with Currly</span>
          </div>
        </div>
      </div>
    </footer>
  );
}