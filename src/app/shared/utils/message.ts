import {
  MESSAGE_DELIVERY_STATUS,
  MESSAGE_TYPE,
  type OptimisticMessage,
} from '@app/core/services/message.service';

export type MessagesKey =
  | readonly ['messages', string, string | undefined]
  | null;

// Keyset pagination by `created_at` of oldest server row in previous page.
// Optimistic temps are excluded so a temp at the tail can't poison the cursor.
export const getMessagesKey =
  (roomId: string | null | undefined) =>
  (
    pageIndex: number,
    previousPageData: OptimisticMessage[] | null,
  ): MessagesKey => {
    if (!roomId) return null;
    if (previousPageData && previousPageData.length === 0) return null;

    if (pageIndex === 0) return ['messages', roomId, undefined];

    const serverRows = previousPageData?.filter((m) => !m.tempId);
    const cursor = serverRows?.[serverRows.length - 1]?.createdAt;
    return ['messages', roomId, cursor];
  };

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

  if (
    temp.type === MESSAGE_TYPE.IMAGE &&
    incoming.type === MESSAGE_TYPE.IMAGE
  ) {
    if (!temp.storagePath || temp.storagePath !== incoming.storagePath)
      return false;
  } else {
    if (temp.content.trim() !== incoming.content.trim()) return false;
  }

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

const makeTempId = () =>
  `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const buildTempMessage = (
  roomId: string,
  senderId: string,
  overrides: Partial<OptimisticMessage> = {},
): OptimisticMessage => {
  const tempId = makeTempId();
  return {
    id: tempId,
    tempId,
    roomId,
    senderId,
    content: '',
    createdAt: new Date().toISOString(),
    status: MESSAGE_DELIVERY_STATUS.SENDING,
    type: MESSAGE_TYPE.TEXT,
    ...overrides,
  };
};

export const mapByTempId = (
  pages: OptimisticMessage[][],
  tempId: string,
  patch: (msg: OptimisticMessage) => OptimisticMessage,
): OptimisticMessage[][] =>
  pages.map((page) =>
    page.map((msg) => (msg.tempId === tempId ? patch(msg) : msg)),
  );

export const replaceTempWithSent = (
  pages: OptimisticMessage[][],
  tempId: string,
  sent: OptimisticMessage,
): OptimisticMessage[][] => {
  let replacedPageIdx = -1;
  const next = pages.map((page, pageIdx) =>
    page.flatMap<OptimisticMessage>((msg) => {
      if (msg.tempId === tempId) {
        replacedPageIdx = pageIdx;
        return [sent];
      }
      if (msg.id === sent.id) return [];
      return [msg];
    }),
  );
  if (replacedPageIdx === -1) {
    const head = next[0] ?? [];
    next[0] = sortPageDesc([sent, ...head]);
  } else {
    next[replacedPageIdx] = sortPageDesc(next[replacedPageIdx]);
  }
  return next.length ? next : [[sent]];
};

export const prependTemp = (
  pages: OptimisticMessage[][] | undefined,
  temp: OptimisticMessage,
): OptimisticMessage[][] => {
  const base = pages?.length ? [...pages] : [[]];
  base[0] = [temp, ...(base[0] ?? [])];
  return base;
};
