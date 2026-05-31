import { supabase } from '@app/libs/supabase/client';
import {
  normalizeProfiles,
  type ProfileRow,
} from '@app/core/mappers/chat.mapper';
import type { Profile } from '@app/types/chat';

export type { Profile } from '@app/types/chat';

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
  return normalizeProfiles((data ?? []) as ProfileRow[]);
};
