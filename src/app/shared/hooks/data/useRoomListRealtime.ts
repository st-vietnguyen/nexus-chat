import { useEffect, useRef } from 'react';
import { useSWRConfig } from 'swr';
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js';
import { supabase } from '@app/libs/supabase/client';
import { useAuth } from '@app/shared/contexts/auth.context';
import type { RoomListItem } from '@app/core/services/room.service';
import {
  normalizeMessage,
  type MessageRow,
} from '@app/core/mappers/chat.mapper';
import { REALTIME_EVENT, REALTIME_SUBSCRIBE_STATES } from '@app/types';
import { TABLES } from '@app/constants/supabase';
import { applyMessageToRoomList } from '@shared/utils/room';

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
      .subscribe((status) => {
        // Subscription dropped — cache may be stale. Re-fetch as safety net.
        if (
          status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR ||
          status === REALTIME_SUBSCRIBE_STATES.TIMED_OUT
        ) {
          mutate(key);
        }
      });

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
      .subscribe((status) => {
        if (
          status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR ||
          status === REALTIME_SUBSCRIBE_STATES.TIMED_OUT
        ) {
          mutate(key);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, mutate]);
};
