import { useEffect, useRef } from 'react';
import { useSWRConfig } from 'swr';
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js';
import { supabase } from '@app/libs/supabase/client';
import { useAuth } from '@app/shared/contexts/auth.context';
import type { Message } from '@app/core/services/message.service';
import type { RoomListItem } from '@app/core/services/room.service';
import { REALTIME_EVENT, DB_TABLE } from '@app/types';

interface ApplyMessageOptions {
  activeRoomId?: string | null;
  currentUserId: string;
}

export const applyMessageToRoomList = (
  rooms: RoomListItem[],
  message: Message,
  { activeRoomId, currentUserId }: ApplyMessageOptions,
): RoomListItem[] => {
  const idx = rooms.findIndex((r) => r.id === message.room_id);
  if (idx === -1) return rooms;

  const existing = rooms[idx];
  const incomingTime = new Date(message.created_at).getTime();
  const existingTime = existing.last_message_at
    ? new Date(existing.last_message_at).getTime()
    : 0;
  // Stale arrivals (older than the cached preview) should still bump unread
  // for peer messages — the count tracks "how many messages since last read",
  // not "did the newest preview change". Only suppress the preview/hoist.
  const isStale = incomingTime <= existingTime;

  const isOwn = message.sender_id === currentUserId;
  const isActive = activeRoomId === message.room_id;
  const nextUnread =
    isOwn || isActive ? existing.unread_count : existing.unread_count + 1;

  if (isStale) {
    if (nextUnread === existing.unread_count) return rooms;
    const updated: RoomListItem = {
      ...existing,
      // eslint-disable-next-line camelcase -- client-side unread field
      unread_count: Math.max(0, nextUnread),
    };
    return rooms.map((r, i) => (i === idx ? updated : r));
  }

  const updated: RoomListItem = {
    ...existing,
    // eslint-disable-next-line camelcase -- matches Postgres column name
    last_message_at: message.created_at,
    // eslint-disable-next-line camelcase -- client-side preview field
    last_message_preview: message.content,
    // eslint-disable-next-line camelcase -- client-side unread field
    unread_count: Math.max(0, nextUnread),
  };

  return [updated, ...rooms.slice(0, idx), ...rooms.slice(idx + 1)];
};

interface UseRoomListRealtimeOptions {
  activeRoomId?: string | null;
}

export const useRoomListRealtime = ({
  activeRoomId,
}: UseRoomListRealtimeOptions = {}) => {
  const { user } = useAuth();
  const { mutate } = useSWRConfig();

  // Keep activeRoomId in a ref so the messages subscription doesn't tear down
  // and re-subscribe on every room change. Resubscribing during navigation
  // opens a window where a freshly inserted message can arrive on the
  // already-removed channel and be dropped, and the new channel hasn't yet
  // received the catch-up.
  const activeRoomIdRef = useRef<string | null | undefined>(activeRoomId);
  activeRoomIdRef.current = activeRoomId;

  // Subscribe once per user without a server-side room_id filter. The previous
  // impl rebuilt `room_id=in.(...)` from the cached rooms set and re-subscribed
  // when membership changed, which left a gap: messages inserted into a newly
  // joined room between the room_members INSERT and the cache revalidation
  // could match neither the old nor the new filter (Postgres realtime does not
  // replay missed events). Filtering client-side closes that gap; unknown
  // room_ids trigger a full rooms revalidate so the new room is picked up.
  useEffect(() => {
    if (!user) return;

    const key = ['rooms', user.id];
    const channel = supabase
      .channel(`user-rooms:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: REALTIME_EVENT.INSERT,
          schema: 'public',
          table: DB_TABLE.MESSAGES,
        },
        (payload: RealtimePostgresInsertPayload<Message>) => {
          const message = payload.new;
          let needsRevalidate = false;
          mutate(
            key,
            (current: RoomListItem[] = []) => {
              if (!current.some((r) => r.id === message.room_id)) {
                // Unknown room — likely a freshly added membership whose row
                // isn't yet in the rooms cache. Flag for a full revalidate
                // after this updater returns so getJoinedRooms backfills the
                // new room with its preview. Invoking mutate inside an updater
                // is unsupported by SWR.
                needsRevalidate = true;
                return current;
              }
              return applyMessageToRoomList(current, message, {
                activeRoomId: activeRoomIdRef.current,
                currentUserId: user.id,
              });
            },
            { revalidate: false },
          );
          if (needsRevalidate) mutate(key);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, mutate]);

  // Separate subscription on room_members for the current user. When a peer
  // creates a new direct room or adds the user to a group, we won't yet have
  // that room_id in cache, so the messages filter above excludes it. Revalidate
  // the rooms cache on membership INSERT to pick up the new room.
  useEffect(() => {
    if (!user) return;

    const key = ['rooms', user.id];
    const channel = supabase
      .channel(`user-memberships:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: REALTIME_EVENT.INSERT,
          schema: 'public',
          table: DB_TABLE.ROOM_MEMBERS,
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          mutate(key);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, mutate]);
};
