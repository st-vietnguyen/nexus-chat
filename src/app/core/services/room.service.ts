import { supabase } from '@app/libs/supabase/client';
import type { Database } from '@app/types/database';

export type Room = Database['public']['Tables']['rooms']['Row'];

export const getJoinedRooms = async (userId: string): Promise<Room[]> => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*, room_members!inner(user_id)')
    .eq('room_members.user_id', userId)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (error) throw error;
  return (data ?? []) as Room[];
};
