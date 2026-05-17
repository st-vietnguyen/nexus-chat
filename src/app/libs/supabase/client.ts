import { createClient } from '@supabase/supabase-js';
import type { Database } from '@app/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (import.meta.env.DEV) {
  if (!supabaseUrl) throw new Error('Missing env: VITE_SUPABASE_URL');
  if (!supabaseKey) throw new Error('Missing env: VITE_SUPABASE_PUBLISHABLE_KEY');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
