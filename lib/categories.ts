/**
 * Single source of truth for category utilities.
 * Shared by HomeClient, DashboardClient, category pages, sitemap.
 */

import {
  Code, PenTool, FileText, Zap, LayoutGrid, Video, Mic,
  ImageIcon, Database, DollarSign, Users, Scale, TrendingUp,
  MessageCircle, Grid2x2, MessageSquare, BarChart3, Globe,
  Search, Shield, BookOpen, Activity,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Convert any category name to a URL-safe kebab-case slug.
 * "Development & Engineering" → "development-engineering"
 * "Content Creation & Media" → "content-creation-media"
 */
export function categoryToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // strip special chars (& / etc)
    .trim()
    .replace(/\s+/g, '-');        // spaces → hyphens
}

/**
 * Best-effort reverse of categoryToSlug for use in DB queries.
 * The category page uses this to turn a URL slug back into an ilike pattern.
 * "development-engineering" → "%development%engineering%"
 */
export function slugToIlikePattern(slug: string): string {
  const words = slug.split('-').filter(Boolean);
  return '%' + words.join('%') + '%';
}

/**
 * Keyword-based icon lookup — works on any free-text category name.
 * Uses the first matching keyword so order matters.
 */
export function getCategoryIcon(name: string): LucideIcon {
  const n = name.toLowerCase();

  if (n.includes('code') || n.includes('develop') || n.includes('engineer') || n.includes('program') || n.includes('software')) return Code;
  if (n.includes('design') || n.includes('ui') || n.includes('ux') || n.includes('creative')) return PenTool;
  if (n.includes('writ') || n.includes('content') || n.includes('blog') || n.includes('copy')) return FileText;
  if (n.includes('market') || n.includes('advertis') || n.includes('campaign') || n.includes('growth')) return Zap;
  if (n.includes('automat') || n.includes('workflow') || n.includes('integrat') || n.includes('no-code') || n.includes('nocode')) return Zap;
  if (n.includes('product') || n.includes('task') || n.includes('organiz') || n.includes('manage')) return LayoutGrid;
  if (n.includes('analyt') || n.includes('insight') || n.includes('report') || n.includes('intel')) return BarChart3;
  if (n.includes('data') || n.includes('databas') || n.includes('sql') || n.includes('etl')) return Database;
  if (n.includes('chat') || n.includes('bot') || n.includes('convers') || n.includes('messag')) return MessageSquare;
  if (n.includes('video') || n.includes('film') || n.includes('movie') || n.includes('stream')) return Video;
  if (n.includes('audio') || n.includes('music') || n.includes('sound') || n.includes('voice') || n.includes('podcast') || n.includes('speech')) return Mic;
  if (n.includes('image') || n.includes('photo') || n.includes('picture') || n.includes('visual') || n.includes('art') || n.includes('generat')) return ImageIcon;
  if (n.includes('financ') || n.includes('account') || n.includes('money') || n.includes('payment') || n.includes('invest') || n.includes('trading')) return DollarSign;
  if (n.includes('hr') || n.includes('human resource') || n.includes('recruit') || n.includes('hire') || n.includes('talent')) return Users;
  if (n.includes('legal') || n.includes('law') || n.includes('contract') || n.includes('complian')) return Scale;
  if (n.includes('sale') || n.includes('crm') || n.includes('revenue') || n.includes('lead')) return TrendingUp;
  if (n.includes('support') || n.includes('customer') || n.includes('service') || n.includes('helpdesk')) return MessageCircle;
  if (n.includes('social') || n.includes('media') || n.includes('influenc')) return Globe;
  if (n.includes('search') || n.includes('seo') || n.includes('discov')) return Search;
  if (n.includes('security') || n.includes('privacy') || n.includes('protect') || n.includes('cyber')) return Shield;
  if (n.includes('educat') || n.includes('learn') || n.includes('course') || n.includes('train') || n.includes('tutor')) return BookOpen;
  if (n.includes('health') || n.includes('medical') || n.includes('wellne') || n.includes('fitness')) return Activity;
  if (n.includes('business') || n.includes('enterprise') || n.includes('b2b') || n.includes('startup')) return BarChart3;

  return Grid2x2;
}
