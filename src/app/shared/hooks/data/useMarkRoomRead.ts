import { useCallback, useEffect, useRef } from 'react';
// eslint-disable-next-line camelcase -- exported by swr
import { useSWRConfig, unstable_serialize } from 'swr';
import { useAuth } from '@app/shared/contexts/auth.context';
import {
  markRoomAsRead,
  type RoomListItem,
} from '@app/core/services/room.service';

export const useMarkRoomRead = (roomId: string | null | undefined) => {
  const { user } = useAuth();
  const { mutate, cache } = useSWRConfig();
  const activeRoomRef = useRef<string | null | undefined>(roomId);
  activeRoomRef.current = roomId;

  const mark = useCallback(async () => {
    if (!user || !roomId) return;
    const key = ['rooms', user.id];

    const patchRoom = (patch: Partial<RoomListItem>) => {
      const cached = cache.get(unstable_serialize(key))?.data as
        | RoomListItem[]
        | undefined;
      if (!cached?.length) return;
      mutate(
        key,
        (current: RoomListItem[] = []) =>
          current.map((room) =>
            room.id === roomId ? { ...room, ...patch } : room,
          ),
        { revalidate: false },
      );
    };

    patchRoom({
      unreadCount: 0,
      lastReadAt: new Date().toISOString(),
    });

    try {
      // Mark the room as read on the server
      const lastReadAt = await markRoomAsRead(roomId);
      if (activeRoomRef.current !== roomId) return;
      patchRoom({ lastReadAt });
    } catch {
      // Next mark attempt will reconcile.
    }
  }, [user, roomId, mutate, cache]);

  useEffect(() => {
    mark();
  }, [mark]);

  return mark;
};
