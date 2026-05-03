import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createAdminClient } from '@/utils/supabase/admin';
import { getStackConfig, STACK_SLUGS } from '@/lib/stack-templates';
import { StackLanding } from './_components/StackLanding';

export function generateStaticParams() {
  return STACK_SLUGS.map(s => ({ 'use-case': s }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ 'use-case': string }>;
}): Promise<Metadata> {
  const config = getStackConfig((await params)['use-case']);
  if (!config) return { title: 'Stack Not Found | Currly' };
  return {
    title: `${config.headline} | Currly`,
    description: config.subheadline,
    openGraph: {
      title: config.headline,
      description: config.subheadline,
    },
  };
}

export default async function StackPage({
  params,
}: {
  params: Promise<{ 'use-case': string }>;
}) {
  const config = getStackConfig((await params)['use-case']);
  if (!config) return notFound();

  const admin = createAdminClient();

  const allSlugs = [...new Set(config.templates.flatMap(t => t.tool_slugs))];

  const { data: toolRows } = await admin
    .from('tools')
    .select('id, name, slug, image_url, main_category, pricing_model, website, description')
    .in('slug', allSlugs)
    .eq('launch_status', 'Live');

  const bySlug = Object.fromEntries((toolRows ?? []).map(t => [t.slug, t]));

  const hydratedTemplates = config.templates.map(tpl => ({
    ...tpl,
    tools: tpl.tool_slugs.map(s => bySlug[s]).filter(Boolean) as any[],
    compare_pairs: tpl.compare_pairs
      .map(([s1, s2]) => [bySlug[s1], bySlug[s2]] as const)
      .filter(([a, b]) => Boolean(a) && Boolean(b)) as any[],
  }));

  return <StackLanding config={config} templates={hydratedTemplates} />;
}
