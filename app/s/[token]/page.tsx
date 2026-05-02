import { createAdminClient } from '@/utils/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Logo } from '@/components/Logo';
import type { Metadata } from 'next';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  if (!UUID_RE.test(token)) return { title: 'Collection | Currly' };

  const admin = createAdminClient();
  const { data } = await admin
    .from('collections')
    .select('name')
    .eq('share_token', token)
    .eq('is_public', true)
    .maybeSingle();

  return {
    title: data ? `${data.name} — a Currly Stack` : 'Collection | Currly',
    description: data ? `Discover ${data.name} — a curated AI tool collection on Currly.` : undefined,
  };
}

export default async function PublicCollectionPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!UUID_RE.test(token)) notFound();

  const admin = createAdminClient();
  const { data } = await admin
    .from('collections')
    .select(`
      id, name, description, created_at,
      collection_tools (
        added_at,
        tools (
          id, name, slug, description, image_url,
          main_category, pricing_model, website
        )
      )
    `)
    .eq('share_token', token)
    .eq('is_public', true)
    .maybeSingle();

  if (!data) notFound();

  const tools = ((data.collection_tools as any[]) || [])
    .map((ct: any) => ct.tools)
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#050505] text-[#1A1A1A] dark:text-white font-sans">
      {/* Minimal nav */}
      <nav className="w-full border-b border-gray-200/50 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/"><Logo /></Link>
          <Link
            href="/login"
            className="text-sm font-bold text-[#0066FF] hover:underline"
          >
            Sign up to build your stack →
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold text-[#0066FF] uppercase tracking-widest mb-2">
            Currly Stack
          </p>
          <h1 className="text-3xl font-bold mb-2">{data.name}</h1>
          {data.description && (
            <p className="text-gray-500 dark:text-gray-400 text-base">{data.description}</p>
          )}
          <p className="text-sm text-gray-400 mt-3">
            {tools.length} {tools.length === 1 ? 'tool' : 'tools'} curated
          </p>
        </div>

        {/* Tools grid */}
        {tools.length === 0 ? (
          <p className="text-gray-400 text-center py-16">This collection is empty.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.map((tool: any) => (
              <div
                key={tool.id}
                className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 flex flex-col"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {tool.image_url ? (
                      <img src={tool.image_url} alt={tool.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-lg font-bold text-gray-400">{tool.name[0]}</span>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full border tracking-wide ${tool.pricing_model?.toLowerCase().includes('free') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 dark:bg-white/10 border-gray-200 dark:border-white/5 text-gray-500'}`}>
                    {tool.pricing_model || 'Paid'}
                  </span>
                </div>

                <Link href={`/tool/${tool.slug}`}>
                  <h3 className="font-bold text-lg mb-1 hover:text-[#0066FF] transition-colors">
                    {tool.name}
                  </h3>
                </Link>
                {tool.main_category && (
                  <span className="text-xs text-[#0066FF] font-medium mb-3">{tool.main_category}</span>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed flex-grow mb-5">
                  {tool.description || `AI tool in the ${tool.main_category || 'AI'} space.`}
                </p>

                <div className="flex gap-2 mt-auto">
                  <Link
                    href={`/tool/${tool.slug}`}
                    className="flex-1 text-center bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-bold py-2.5 rounded-xl hover:border-[#0066FF] transition-colors"
                  >
                    Details
                  </Link>
                  {tool.website && (
                    <a
                      href={tool.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center bg-[#0066FF] text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#0052CC] transition-colors"
                    >
                      Visit <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center py-12 border-t border-gray-100 dark:border-white/5">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Discover and organise AI tools with Currly
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-[#0066FF] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#0052CC] transition-colors shadow-lg shadow-blue-500/20"
          >
            Build your own stack →
          </Link>
        </div>
      </main>
    </div>
  );
}
