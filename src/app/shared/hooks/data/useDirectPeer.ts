import { useCallback } from 'react';
import useSWR from 'swr';
import { getDirectRoomPeer } from '@app/core/services/room.service';
import { useAuth } from '@app/shared/contexts/auth.context';

export const useDirectPeer = (roomId: string, enabled: boolean) => {
  const { user } = useAuth();

  const fetcher = useCallback(
    ([, rId, uId]: [string, string, string]) => getDirectRoomPeer(rId, uId),
    [],
  );

  return useSWR(
    enabled && user ? ['direct-peer', roomId, user.id] : null,
    fetcher,
  );
};
