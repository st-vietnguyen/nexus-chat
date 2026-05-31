import { useCallback } from 'react';
import useSWR, { type SWRResponse } from 'swr';
import { useAuth } from '@app/shared/contexts/auth.context';
import {
  getJoinedRooms,
  type RoomListItem,
} from '@app/core/services/room.service';

// Single source of truth for the rooms SWR slot. All consumers (sidebar,
// header, route guards) share the same key + fetcher so SWR dedupes the
// network request and the cache shape stays consistent.
export const useJoinedRooms = (): SWRResponse<RoomListItem[]> => {
  const { user } = useAuth();
  const fetcher = useCallback(
    (): Promise<RoomListItem[]> => getJoinedRooms(user!.id),
    [user?.id],
  );
  return useSWR<RoomListItem[]>(user ? ['rooms', user.id] : null, fetcher);
};
