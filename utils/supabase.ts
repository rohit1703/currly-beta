// utils/supabase.ts
import { createBrowserClient } from '@supabase/ssr'

// Returns a fresh client per call — never share a singleton across requests
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}