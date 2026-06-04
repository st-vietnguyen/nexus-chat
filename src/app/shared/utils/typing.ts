// Pure helpers for the typing-indicator reducer. Extracted from the hook so
// the throttle window, expiry semantics, and self-suppression can be unit
// tested without spinning up a Supabase Realtime channel.

export interface TypingEvent {
  fromUserId: string;
  selfUserId: string;
}

export const TYPING_BROADCAST_EVENT = 'typing';
export const TYPING_EXPIRY_MS = 3000;
export const TYPING_THROTTLE_MS = 1500;

// Returns `null` to signal "ignore this event" (self or missing id). Returns
// the next list when the peer should be marked typing. Deduplicates so the
// list contains each peer at most once.
export const acceptTypingEvent = (
  prev: string[],
  { fromUserId, selfUserId }: TypingEvent,
): string[] | null => {
  if (!fromUserId) return null;
  if (fromUserId === selfUserId) return null;
  if (prev.includes(fromUserId)) return prev;
  return [...prev, fromUserId];
};

export const removeTypingUser = (prev: string[], userId: string): string[] =>
  prev.filter((id) => id !== userId);

export const shouldThrottleSend = (
  lastSentAt: number,
  now: number,
  throttleMs: number = TYPING_THROTTLE_MS,
): boolean => now - lastSentAt < throttleMs;
