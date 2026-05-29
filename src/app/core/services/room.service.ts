import { supabase } from '@app/libs/supabase/client';
import type { Database } from '@app/types/database';

export type Room = Database['public']['Tables']['rooms']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

// Client-side augmentation. `last_message_preview` is not persisted on `rooms`;
// it is populated from realtime INSERTs into `messages` to show in the list.
// `last_read_at` mirrors the current user's row in `room_members` so unread
// counts can be recomputed locally on realtime INSERTs without a refetch.
export type RoomListItem = Room & {
  last_message_preview?: string | null;
  last_read_at: string;
  unread_count: number;
};

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

export const getJoinedRooms = async (
  userId: string,
): Promise<RoomListItem[]> => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*, room_members!inner(user_id, last_read_at)')
    .eq('room_members.user_id', userId)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (error) throw error;

  type Joined = Room & {
    room_members: { user_id: string; last_read_at: string }[];
  };
  const rooms = (data ?? []) as Joined[];
  if (rooms.length === 0) return [];

  // Backfill last_message_preview with one limit(1) query per room in parallel.
  // Earlier impl pulled every message across every joined room in one query and
  // grouped client-side, which scaled O(total messages) — easily tens of
  // thousands of rows and hit the PostgREST 1000-row cap, silently dropping
  // previews for older-active rooms.
  // Use allSettled so a single failed preview fetch degrades to a null preview
  // for that one room instead of failing the entire rooms list.
  const previews = await Promise.allSettled(
    rooms.map(async (r) => {
      if (!r.last_message_at) return null;
      const { data: latest, error: msgErr } = await supabase
        .from('messages')
        .select('content')
        .eq('room_id', r.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (msgErr) throw msgErr;
      return latest?.content ?? null;
    }),
  );

  // Head-only count per room of messages newer than last_read_at, excluding
  // the user's own messages so sending does not show as unread to the sender.
  const unreadCounts = await Promise.allSettled(
    rooms.map(async (r) => {
      const lastRead = r.room_members[0]?.last_read_at;
      if (!r.last_message_at || !lastRead) return 0;
      if (
        new Date(r.last_message_at).getTime() <= new Date(lastRead).getTime()
      ) {
        return 0;
      }
      const { count, error: cntErr } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('room_id', r.id)
        .neq('sender_id', userId)
        .gt('created_at', lastRead);
      if (cntErr) throw cntErr;
      return count ?? 0;
    }),
  );

  return rooms.map((r, idx) => {
    const previewResult = previews[idx];
    const unreadResult = unreadCounts[idx];
    const { room_members: members, ...room } = r;
    return {
      ...room,
      // eslint-disable-next-line camelcase -- client-side preview field
      last_message_preview:
        previewResult.status === 'fulfilled' ? previewResult.value : null,
      // eslint-disable-next-line camelcase -- mirrors db column
      last_read_at: members[0]?.last_read_at ?? new Date(0).toISOString(),
      // eslint-disable-next-line camelcase -- client-side unread field
      unread_count:
        unreadResult.status === 'fulfilled' ? unreadResult.value : 0,
    };
  });
};

export const markRoomAsRead = async (roomId: string): Promise<string> => {
  const { data, error } = await supabase.rpc('mark_room_read', {
    // eslint-disable-next-line camelcase -- matches Postgres function parameter
    p_room_id: roomId,
  });
  if (error) throw error;
  return data as string;
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
