import useSWR from 'swr';
import { useAuth } from '@app/shared/contexts/auth.context';
import { getJoinedRooms, type Room } from '@app/core/services/room.service';

export const useRooms = () => {
  const { user } = useAuth();

  return useSWR<Room[]>(user ? ['rooms', user.id] : null, () =>
    getJoinedRooms(user!.id),
  );
};
