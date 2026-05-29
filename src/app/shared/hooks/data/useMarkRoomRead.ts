import { useCallback, useEffect, useRef } from 'react';
// eslint-disable-next-line camelcase -- exported by swr
import { useSWRConfig, unstable_serialize } from 'swr';
import { useAuth } from '@app/shared/contexts/auth.context';
import {
  markRoomAsRead,
  type RoomListItem,
} from '@app/core/services/room.service';

// Marks a room read whenever it becomes the open room, then exposes a manual
// `mark` for incoming-while-open events. SWR cache for ['rooms', userId] is
// updated optimistically (unread_count -> 0, last_read_at bumped) so the badge
// disappears immediately; the RPC call backs it up. Errors are swallowed —
// next mount/incoming will retry and the count converges.
export const useMarkRoomRead = (roomId: string | null | undefined) => {
  const { user } = useAuth();
  const { mutate, cache } = useSWRConfig();
  // Drop responses for stale room ids when the user rapidly switches rooms.
  const activeRoomRef = useRef<string | null | undefined>(roomId);
  activeRoomRef.current = roomId;

  const mark = useCallback(async () => {
    if (!user || !roomId) return;
    const key = ['rooms', user.id];

    // Calling mutate with `{ revalidate: false }` while the rooms cache slot
    // is still empty races the in-flight RoomList fetcher: SWR commits the
    // updater output and skips any subsequent revalidation, which on a hard
    // reload at /chat/rooms/:roomId leaves the sidebar permanently empty.
    // Guard by reading the cache first and skipping the patch until the
    // fetch has resolved at least once.
    const patchRoom = (patch: Partial<RoomListItem>) => {
      const cached = cache.get(unstable_serialize(key))?.data as
        | RoomListItem[]
        | undefined;
      if (!cached?.length) return;
      mutate(
        key,
        (current: RoomListItem[] = []) =>
          current.map((r) => (r.id === roomId ? { ...r, ...patch } : r)),
        { revalidate: false },
      );
    };

    patchRoom({
      // eslint-disable-next-line camelcase -- client-side fields
      unread_count: 0,
      // eslint-disable-next-line camelcase -- mirrors db column
      last_read_at: new Date().toISOString(),
    });

    try {
      const serverTs = await markRoomAsRead(roomId);
      if (activeRoomRef.current !== roomId) return;
      // eslint-disable-next-line camelcase -- mirrors db column
      patchRoom({ last_read_at: serverTs });
    } catch {
      // Next mark attempt will reconcile.
    }
  }, [user, roomId, mutate, cache]);

  useEffect(() => {
    mark();
  }, [mark]);

  return mark;
};
