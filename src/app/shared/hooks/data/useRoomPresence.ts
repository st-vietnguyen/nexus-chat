import { useEffect, useState } from 'react';
import { supabase } from '@app/libs/supabase/client';
import { useAuth } from '@app/shared/contexts/auth.context';

interface UseRoomPresenceResult {
  onlineUserIds: string[];
}

export const useRoomPresence = (
  roomId: string | null | undefined,
): UseRoomPresenceResult => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (!roomId || !userId) return;

    const channel = supabase.channel(`room-presence:${roomId}`, {
      config: { presence: { key: userId } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOnlineUserIds(Object.keys(state));
      })
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') return;
        channel.track({ onlineAt: new Date().toISOString() });
      });

    return () => {
      setOnlineUserIds([]);
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [roomId, userId]);

  return { onlineUserIds };
};
