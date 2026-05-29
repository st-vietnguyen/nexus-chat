import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import { useAuth } from '@app/shared/contexts/auth.context';
import { getOrCreateDirectRoom } from '@app/core/services/room.service';

export const useStartDirectChat = () => {
  const navigate = useNavigate();
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
        navigate(`/chat/rooms/${roomId}`);
        return roomId;
      } finally {
        setIsStarting(false);
      }
    },
    [navigate, mutate, user],
  );

  return { startDirectChat, isStarting };
};
