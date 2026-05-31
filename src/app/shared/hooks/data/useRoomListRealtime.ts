import { useEffect, useRef } from 'react';
import { useSWRConfig } from 'swr';
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js';
import { supabase } from '@app/libs/supabase/client';
import { useAuth } from '@app/shared/contexts/auth.context';
import type { Message } from '@app/core/services/message.service';
import type { RoomListItem } from '@app/core/services/room.service';
import {
  normalizeMessage,
  type MessageRow,
} from '@app/core/mappers/chat.mapper';
import { REALTIME_EVENT } from '@app/types';
import { TABLES } from '@app/constants/supabase';

interface ApplyMessageOptions {
  activeRoomId?: string | null;
  currentUserId: string;
}

export const applyMessageToRoomList = (
  rooms: RoomListItem[],
  message: Message,
  { activeRoomId, currentUserId }: ApplyMessageOptions,
): RoomListItem[] => {
  const idx = rooms.findIndex((r) => r.id === message.roomId);
  if (idx === -1) return rooms;

  const existing = rooms[idx];
  const incomingTime = new Date(message.createdAt).getTime();
  const existingTime = existing.lastMessageAt
    ? new Date(existing.lastMessageAt).getTime()
    : 0;
  // Stale arrivals (older than the cached preview) should still bump unread
  // for peer messages — the count tracks "how many messages since last read",
  // not "did the newest preview change". Only suppress the preview/hoist.
  const isStale = incomingTime <= existingTime;

  const isOwn = message.senderId === currentUserId;
  const isActive = activeRoomId === message.roomId;
  const nextUnread =
    isOwn || isActive ? existing.unreadCount : existing.unreadCount + 1;

  if (isStale) {
    if (nextUnread === existing.unreadCount) return rooms;
    const updated: RoomListItem = {
      ...existing,
      unreadCount: Math.max(0, nextUnread),
    };
    return rooms.map((r, i) => (i === idx ? updated : r));
  }

  const updated: RoomListItem = {
    ...existing,
    lastMessageAt: message.createdAt,
    lastMessagePreview: message.content,
    unreadCount: Math.max(0, nextUnread),
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

  const activeRoomIdRef = useRef<string | null | undefined>(activeRoomId);
  activeRoomIdRef.current = activeRoomId;

  // Subscribe once per user without a server-side room_id filter. The previous
  // impl rebuilt `room_id=in.(...)` from the cached rooms set and re-subscribed
  // when membership changed, which left a gap: messages inserted into a newly
  // joined room between the room_members INSERT and the cache revalidation
  // could match neither the old nor the new filter (Postgres realtime does not
  // replay missed events). Filtering client-side closes that gap; unknown
  // roomIds trigger a full rooms revalidate so the new room is picked up.
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
          table: TABLES.MESSAGES,
        },
        (payload: RealtimePostgresInsertPayload<MessageRow>) => {
          const message = normalizeMessage(payload.new);
          let needsRevalidate = false;
          mutate(
            key,
            (current: RoomListItem[] = []) => {
              if (!current.some((r) => r.id === message.roomId)) {
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
          table: TABLES.ROOM_MEMBERS,
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
