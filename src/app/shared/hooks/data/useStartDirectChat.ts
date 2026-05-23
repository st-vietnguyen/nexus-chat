import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSWRConfig } from 'swr';
import { useAuth } from '@app/shared/contexts/auth.context';
import { getOrCreateDirectRoom } from '@app/core/services/room.service';
import { setSelectedRoomId } from '@app/pages/chat/chat.slice';

export const useStartDirectChat = () => {
  const dispatch = useDispatch();
  const { mutate } = useSWRConfig();
  const { user } = useAuth();
  const [isStarting, setIsStarting] = useState(false);

  const startDirectChat = useCallback(
    async (otherUserId: string) => {
      if (!user) throw new Error('Not authenticated');
      setIsStarting(true);
      try {
        const roomId = await getOrCreateDirectRoom(otherUserId);
        await mutate(['rooms', user.id]);
        dispatch(setSelectedRoomId(roomId));
        return roomId;
      } finally {
        setIsStarting(false);
      }
    },
    [dispatch, mutate, user],
  );

  return { startDirectChat, isStarting };
};
