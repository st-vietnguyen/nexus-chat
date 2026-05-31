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
  if (temp.status !== MESSAGE_DELIVERY_STATUS.SENDING) return false;
  if (temp.senderId !== incoming.senderId) return false;
  if (temp.content.trim() !== incoming.content.trim()) return false;
  const tempTime = new Date(temp.createdAt).getTime();
  const incomingTime = new Date(incoming.createdAt).getTime();
  return Math.abs(incomingTime - tempTime) <= RECONCILE_WINDOW_MS;
};

// Page is DESC by createdAt (newest first). Stable sort preserves relative
// order of equal timestamps.
export const sortPageDesc = (page: OptimisticMessage[]): OptimisticMessage[] =>
  [...page].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

export const reconcileIncomingMessage = (
  pages: OptimisticMessage[][],
  incoming: OptimisticMessage,
): OptimisticMessage[][] => {
  const safePages = pages.length ? pages : [[]];

  const hasMatch = safePages.some((page) =>
    page.some((m) => m.id === incoming.id),
  );
  if (hasMatch) {
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
