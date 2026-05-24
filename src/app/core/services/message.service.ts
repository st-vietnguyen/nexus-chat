import { supabase } from '@app/libs/supabase/client';
import type { Database } from '@app/types/database';

export type Message = Database['public']['Tables']['messages']['Row'];

export const MESSAGE_PAGE_SIZE = 30;

export const getMessagesByRoomId = async (
  roomId: string,
  cursor?: string,
): Promise<Message[]> => {
  let query = supabase
    .from('messages')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .limit(MESSAGE_PAGE_SIZE);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []) as Message[];
};
