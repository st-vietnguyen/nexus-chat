import { useEffect, useState } from 'react';
import { supabase } from '@app/libs/supabase/client';
import { useAuth } from '@app/shared/contexts/auth.context';

interface UseRoomPresenceResult {
  onlineUserIds: string[];
}

// Room-scoped presence. Each member of the open room tracks itself on a
// per-room channel; sync gives the full set of present user IDs. Intentionally
// not global — global presence would need a top-level channel that survives
// route changes and pull membership data we don't yet maintain. Room-level is
// enough to drive the header dot and per-message read state.
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
        void channel.track({ onlineAt: new Date().toISOString() });
      });

    return () => {
      setOnlineUserIds([]);
      void channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [roomId, userId]);

  return { onlineUserIds };
};
