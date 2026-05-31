import { supabase } from '@app/libs/supabase/client';
import {
  normalizeProfile,
  normalizeRoomListItem,
  type ProfileRow,
  type RoomRow,
} from '@app/core/mappers/chat.mapper';
import type { Profile, RoomListItem } from '@app/types/chat';

export type { Room, RoomListItem, Profile } from '@app/types/chat';

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
  return profile ? normalizeProfile(profile as ProfileRow) : null;
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

  type Joined = RoomRow & {
    room_members: { user_id: string; last_read_at: string }[];
  };
  const rooms = (data ?? []) as Joined[];
  if (rooms.length === 0) return [];

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
    const { room_members: members, ...row } = r;
    return normalizeRoomListItem({
      row: row as RoomRow,
      lastReadAt: members[0]?.last_read_at ?? new Date(0).toISOString(),
      unreadCount: unreadResult.status === 'fulfilled' ? unreadResult.value : 0,
      lastMessagePreview:
        previewResult.status === 'fulfilled' ? previewResult.value : null,
    });
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
