import { useEffect, useRef } from 'react';
import { useSWRConfig } from 'swr';
// eslint-disable-next-line camelcase -- exported by swr/infinite
import { unstable_serialize } from 'swr/infinite';
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js';
import { supabase } from '@app/libs/supabase/client';
import {
  MESSAGE_DELIVERY_STATUS,
  type Message,
  type OptimisticMessage,
} from '@app/core/services/message.service';
import {
  normalizeMessage,
  type MessageRow,
} from '@app/core/mappers/chat.mapper';
import { REALTIME_EVENT, REALTIME_SUBSCRIBE_STATES } from '@app/types';
import { TABLES } from '@app/constants/supabase';
import {
  getMessagesKey,
  reconcileIncomingMessage,
} from '@shared/utils/message';

interface UseRoomMessagesRealtimeOptions {
  onIncoming?: (message: Message) => void;
}

export const useRoomMessagesRealtime = (
  roomId: string | null | undefined,
  { onIncoming }: UseRoomMessagesRealtimeOptions = {},
) => {
  const { mutate } = useSWRConfig();
  const onIncomingRef = useRef(onIncoming);
  onIncomingRef.current = onIncoming;

  useEffect(() => {
    if (!roomId) return;

    const key = unstable_serialize(getMessagesKey(roomId));
    const channel = supabase
      .channel(`room-messages:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: REALTIME_EVENT.INSERT,
          schema: 'public',
          table: TABLES.MESSAGES,
          filter: `room_id=eq.${roomId}`,
        },
        (payload: RealtimePostgresInsertPayload<MessageRow>) => {
          const message = normalizeMessage(payload.new);
          const incoming: OptimisticMessage = {
            ...message,
            status: MESSAGE_DELIVERY_STATUS.SENT,
          };

          mutate(
            key,
            (pages: OptimisticMessage[][] = [[]]) =>
              reconcileIncomingMessage(pages, incoming),
            { revalidate: false },
          );

          onIncomingRef.current?.(message);
        },
      )
      .subscribe((status) => {
        // Subscription dropped — page may have missed inserts. Re-fetch first page.
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
  }, [roomId, mutate]);
};
