// utils/supabase.ts
import { createBrowserClient } from '@supabase/ssr'

// This file is for CLIENT components (Dashboard, Login, etc.)
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)