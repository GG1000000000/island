import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Supabase client pinned to the `app` schema where every Island table lives.
 * Anon key is public by design (Supabase RLS gates row access).
 */
export const supabase = createClient<Database, 'app'>(url, key, {
  db: { schema: 'app' },
  auth: { persistSession: false },
});
