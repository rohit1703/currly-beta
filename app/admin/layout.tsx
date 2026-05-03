import Link from 'next/link';
import { LayoutDashboard, Search, BarChart3, Users, Activity, Wrench, PlusCircle, ShieldCheck, Upload, Vote } from 'lucide-react';

const nav = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Search Intelligence', href: '/admin/search', icon: Search },
  { label: 'Tool Analytics', href: '/admin/tools-analytics', icon: BarChart3 },
  { label: 'Decisions', href: '/admin/decisions', icon: Vote },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Index Health', href: '/admin/health', icon: Activity },
  { label: 'Real-time', href: '/admin/realtime', icon: Activity },
  { divider: true },
  { label: 'Manage Tools', href: '/admin/manage', icon: Wrench },
  { label: 'Add New Tool', href: '/admin/manage/new', icon: PlusCircle },
  { label: 'Bulk Import', href: '/admin/import', icon: Upload },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-950 text-white">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-white/5 flex flex-col">
        <div className="px-5 py-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0066FF]" />
            <span className="font-bold text-sm">Currly Admin</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map((item, i) =>
            'divider' in item ? (
              <div key={i} className="my-3 border-t border-white/5" />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            )
          )}
        </nav>
        <div className="px-5 py-4 border-t border-white/5">
          <Link href="/" className="text-xs text-gray-500 hover:text-white transition-colors">← Back to Currly</Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
