import {
  MESSAGE_DELIVERY_STATUS,
  type OptimisticMessage,
} from '@app/core/services/message.service';

// Time window (ms) for matching an optimistic temp to a server INSERT echo.
// Covers normal network latency without spanning multiple distinct sends.
export const RECONCILE_WINDOW_MS = 60_000;

const isMatchingTemp = (
  temp: OptimisticMessage,
  incoming: OptimisticMessage,
): boolean => {
  if (!temp.tempId) return false;
  // Only absorb SENDING temps. Matching FAILED temps by content+sender+window
  // collapses unrelated retyped duplicates from another tab/session, hiding
  // genuine send failures. retry() handles the "RPC silently succeeded" case
  // by checking for a real duplicate in cache before resending.
  if (temp.status !== MESSAGE_DELIVERY_STATUS.SENDING) return false;
  if (temp.sender_id !== incoming.sender_id) return false;
  // Compare trimmed content. Send flow trims before creating the temp; server
  // may also normalize whitespace. Trim both sides so future normalization
  // doesn't silently break reconciliation.
  if (temp.content.trim() !== incoming.content.trim()) return false;
  const tempTime = new Date(temp.created_at).getTime();
  const incomingTime = new Date(incoming.created_at).getTime();
  return Math.abs(incomingTime - tempTime) <= RECONCILE_WINDOW_MS;
};

// Page is DESC by created_at (newest first). Stable sort preserves relative
// order of equal timestamps.
export const sortPageDesc = (page: OptimisticMessage[]): OptimisticMessage[] =>
  [...page].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

/**
 * Merge a server message into paginated SWR cache.
 * - If id already present → no-op (dedup realtime echo of own send).
 * - Else if a SENDING temp matches by sender/content/timestamp → replace in place,
 *   then re-sort page[0] so the reconciled server time wins over any interim
 *   prepends from other users.
 * - Else → prepend to newest page.
 * Pure: returns new pages array; never mutates input.
 */
export const reconcileIncomingMessage = (
  pages: OptimisticMessage[][],
  incoming: OptimisticMessage,
): OptimisticMessage[][] => {
  const safePages = pages.length ? pages : [[]];

  if (safePages.some((page) => page.some((m) => m.id === incoming.id))) {
    return pages;
  }

  let replacedPageIdx = -1;
  const merged = safePages.map((page, pageIdx) =>
    page.map((msg) => {
      if (replacedPageIdx === -1 && isMatchingTemp(msg, incoming)) {
        replacedPageIdx = pageIdx;
        return incoming;
      }
      return msg;
    }),
  );

  if (replacedPageIdx !== -1) {
    const next = [...merged];
    next[replacedPageIdx] = sortPageDesc(next[replacedPageIdx]);
    return next;
  }

  const next = [...merged];
  next[0] = sortPageDesc([incoming, ...(next[0] ?? [])]);
  return next;
};
