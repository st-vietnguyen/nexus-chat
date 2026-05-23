import { supabase } from '@app/libs/supabase/client';
import type { Database } from '@app/types/database';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export const getProfiles = async (
  excludeUserId: string,
): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, email, avatar_url, created_at')
    .neq('id', excludeUserId)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) throw error;
  return data ?? [];
};
