import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from 'react';
import { supabase } from '@app/libs/supabase/client';
import { useAuth } from './auth.context';
import { REALTIME_SUBSCRIBE_STATES } from '@app/types/realtime';

interface PresenceContextType {
  isUserOnline: (userId: string) => boolean;
}

const PresenceContext = createContext<PresenceContextType>({
  isUserOnline: () => false,
});

export const PresenceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel('app-presence', {
      config: { presence: { key: userId } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const nextIds = Object.keys(state);
        setOnlineUserIds((prev) => {
          if (
            nextIds.length === prev.size &&
            nextIds.every((id) => prev.has(id))
          ) {
            return prev;
          }
          return new Set(nextIds);
        });
      })
      .subscribe((status) => {
        if (status !== REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) return;
        channel.track({ onlineAt: new Date().toISOString() });
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const isUserOnline = useCallback(
    (id: string) => onlineUserIds.has(id),
    [onlineUserIds],
  );

  const value = useMemo(() => ({ isUserOnline }), [isUserOnline]);

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresence = () => useContext(PresenceContext);
