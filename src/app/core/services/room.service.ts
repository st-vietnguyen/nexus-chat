import { supabase } from '@app/libs/supabase/client';
import type { Database } from '@app/types/database';

export type Room = Database['public']['Tables']['rooms']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

export const getDirectRoomPeer = async (
  roomId: string,
  currentUserId: string,
): Promise<Profile | null> => {
  const { data: member, error: memberErr } = await supabase
    .from('room_members')
    .select('user_id')
    .eq('room_id', roomId)
    .neq('user_id', currentUserId)
    .maybeSingle();

  if (memberErr) throw memberErr;
  if (!member) return null;

  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', member.user_id)
    .maybeSingle();

  if (profileErr) throw profileErr;
  return profile;
};

export const getJoinedRooms = async (userId: string): Promise<Room[]> => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*, room_members!inner(user_id)')
    .eq('room_members.user_id', userId)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (error) throw error;
  return (data ?? []) as Room[];
};

export const getOrCreateDirectRoom = async (
  otherUserId: string,
): Promise<string> => {
  const { data, error } = await supabase.rpc('get_or_create_direct_room', {
    // eslint-disable-next-line camelcase -- matches Postgres function parameter
    other_user_id: otherUserId,
  });
  if (error) throw error;
  return data as string;
};
