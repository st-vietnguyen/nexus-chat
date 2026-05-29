import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@app/libs/supabase/client';
import { useAuth } from '@app/shared/contexts/auth.context';
import {
  TYPING_BROADCAST_EVENT,
  TYPING_EXPIRY_MS,
  TYPING_THROTTLE_MS,
  acceptTypingEvent,
  removeTypingUser,
  shouldThrottleSend,
} from './typingState';

interface TypingPayload {
  userId: string;
}

interface UseTypingIndicatorResult {
  typingUserIds: string[];
  notifyTyping: () => void;
}

export const useTypingIndicator = (
  roomId: string | null | undefined,
): UseTypingIndicatorResult => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);
  // Per-peer expiry timer. Refreshed on each incoming event so the indicator
  // stays visible while the peer keeps typing.
  const peerTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  // Last broadcast timestamp for the local user. Throttles sends.
  const lastSentAtRef = useRef(0);
  // Channel ref so `notifyTyping` can send without rebuilding the channel.
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!roomId || !userId) return;

    const peerTimers = peerTimersRef.current;
    const channel = supabase.channel(`room-typing:${roomId}`, {
      config: { broadcast: { self: false } },
    });
    channelRef.current = channel;

    channel.on(
      'broadcast',
      { event: TYPING_BROADCAST_EVENT },
      ({ payload }: { payload: TypingPayload }) => {
        const fromId = payload?.userId;
        if (!fromId) return;

        const existing = peerTimers.get(fromId);
        if (existing) clearTimeout(existing);

        const timer = setTimeout(() => {
          peerTimers.delete(fromId);
          setTypingUserIds((prev) => removeTypingUser(prev, fromId));
        }, TYPING_EXPIRY_MS);
        peerTimers.set(fromId, timer);

        setTypingUserIds((prev) => {
          const next = acceptTypingEvent(prev, {
            fromUserId: fromId,
            selfUserId: userId,
          });
          return next ?? prev;
        });
      },
    );

    channel.subscribe();

    return () => {
      peerTimers.forEach((t) => clearTimeout(t));
      peerTimers.clear();
      setTypingUserIds([]);
      lastSentAtRef.current = 0;
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [roomId, userId]);

  const notifyTyping = useCallback(() => {
    const channel = channelRef.current;
    if (!channel || !userId) return;

    const now = Date.now();
    if (shouldThrottleSend(lastSentAtRef.current, now, TYPING_THROTTLE_MS))
      return;
    lastSentAtRef.current = now;

    channel.send({
      type: 'broadcast',
      event: TYPING_BROADCAST_EVENT,
      payload: { userId } satisfies TypingPayload,
    });
  }, [userId]);

  return { typingUserIds, notifyTyping };
};
