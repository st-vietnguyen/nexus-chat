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
import { REALTIME_EVENT, DB_TABLE } from '@app/types';
import { getMessagesKey } from './useMessages';
import { reconcileIncomingMessage } from './reconcileMessages';

interface UseRoomMessagesRealtimeOptions {
  onIncoming?: (message: Message) => void;
}

export const useRoomMessagesRealtime = (
  roomId: string | null | undefined,
  { onIncoming }: UseRoomMessagesRealtimeOptions = {},
) => {
  const { mutate } = useSWRConfig();
  // Keep a ref so the channel subscription doesn't rebind on every parent
  // render that passes a new inline callback.
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
          table: DB_TABLE.MESSAGES,
          filter: `room_id=eq.${roomId}`,
        },
        (payload: RealtimePostgresInsertPayload<Message>) => {
          const incoming: OptimisticMessage = {
            ...payload.new,
            status: MESSAGE_DELIVERY_STATUS.SENT,
          };

          mutate(
            key,
            (pages: OptimisticMessage[][] = [[]]) =>
              reconcileIncomingMessage(pages, incoming),
            { revalidate: false },
          );

          onIncomingRef.current?.(payload.new);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, mutate]);
};
