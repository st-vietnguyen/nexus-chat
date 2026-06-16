import { useCallback, useMemo } from 'react';
import useSWR, { useSWRConfig, type SWRResponse } from 'swr';
import {
  getDirectRoomPeer,
  type Profile,
  type RoomListItem,
} from '@app/core/services/room.service';
import { useAuth } from '@app/shared/contexts/auth.context';
import { ROOM_TYPE } from '@app/types';

export type DirectPeersMap = Record<string, Profile | null>;

export const useDirectPeers = (
  rooms: RoomListItem[] | undefined,
): SWRResponse<DirectPeersMap> => {
  const { user } = useAuth();
  const { mutate } = useSWRConfig();

  const directIds = useMemo(
    () =>
      (rooms ?? [])
        .filter((r) => r.type === ROOM_TYPE.DIRECT)
        .map((r) => r.id)
        .sort(),
    [rooms],
  );

  const fetcher = useCallback(async (): Promise<DirectPeersMap> => {
    if (!user) return {};
    const entries = await Promise.all(
      directIds.map(async (id) => {
        const profile = await getDirectRoomPeer(id, user.id);
        mutate(['direct-peer', id, user.id], profile, { revalidate: false });
        return [id, profile] as const;
      }),
    );
    return Object.fromEntries(entries);
  }, [directIds, user?.id, mutate]);

  const key =
    user && directIds.length > 0
      ? (['direct-peers', user.id, directIds.join(',')] as const)
      : null;

  return useSWR<DirectPeersMap>(key, fetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
};
