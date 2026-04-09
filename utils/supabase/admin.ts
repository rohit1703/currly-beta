import { createClient } from '@supabase/supabase-js';

// Service role client — only use in server components / server actions
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
