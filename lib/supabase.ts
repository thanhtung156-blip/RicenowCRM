import { createClient } from '@supabase/supabase-js';

// Server-side only — dùng Service Role Key để bypass RLS.
// File này chỉ được import trong API routes / server components.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  { auth: { persistSession: false } }
);
