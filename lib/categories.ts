/**
 * Single source of truth for category utilities.
 * Shared by HomeClient, DashboardClient, category pages, sitemap.
 */

import {
  Code, PenTool, Zap, BarChart3, DollarSign, Users,
  TrendingUp, MessageCircle, BookOpen, Activity, Globe, Bot,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Category {
  name: string;
  icon: LucideIcon;
}

/** The 12 canonical categories — single source of truth. */
export const CATEGORIES: Category[] = [
  { name: 'AI Agents & Assistants',    icon: Bot },
  { name: 'Content & Creative',         icon: PenTool },
  { name: 'Customer Support',           icon: MessageCircle },
  { name: 'Data & Analytics',           icon: BarChart3 },
  { name: 'Development & Engineering',  icon: Code },
  { name: 'Education & Learning',       icon: BookOpen },
  { name: 'Finance & Legal',            icon: DollarSign },
  { name: 'Health & Wellness',          icon: Activity },
  { name: 'HR & Recruitment',           icon: Users },
  { name: 'Marketing & Sales',          icon: TrendingUp },
  { name: 'Productivity & Automation',  icon: Zap },
  { name: 'Specialized Industry',       icon: Globe },
];

/**
 * Convert any category name to a URL-safe kebab-case slug.
 * "Development & Engineering" → "development-engineering"
 */
export function categoryToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Reverse a slug back to the canonical category name.
 * "development-engineering" → "Development & Engineering"
 * Returns undefined if the slug doesn't match a canonical category.
 */
export function slugToCategory(slug: string): string | undefined {
  return CATEGORIES.find(c => categoryToSlug(c.name) === slug)?.name;
}

/** Return the icon for a category name, with keyword fallback for non-canonical names. */
export function getCategoryIcon(name: string): LucideIcon {
  const match = CATEGORIES.find(c => c.name === name);
  if (match) return match.icon;

  const n = name.toLowerCase();
  if (n.includes('code') || n.includes('develop') || n.includes('engineer')) return Code;
  if (n.includes('design') || n.includes('creative') || n.includes('content')) return PenTool;
  if (n.includes('market') || n.includes('sale') || n.includes('crm')) return TrendingUp;
  if (n.includes('automat') || n.includes('product') || n.includes('workflow')) return Zap;
  if (n.includes('analyt') || n.includes('data')) return BarChart3;
  if (n.includes('support') || n.includes('customer')) return MessageCircle;
  if (n.includes('hr') || n.includes('recruit') || n.includes('talent')) return Users;
  if (n.includes('financ') || n.includes('legal') || n.includes('invest')) return DollarSign;
  if (n.includes('educat') || n.includes('learn')) return BookOpen;
  if (n.includes('health') || n.includes('wellne')) return Activity;
  if (n.includes('agent') || n.includes('assistant') || n.includes('chat') || n.includes('bot')) return Bot;
  return Globe;
}
