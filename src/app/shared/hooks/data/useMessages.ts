import { useCallback, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import {
  MESSAGE_PAGE_SIZE,
  getMessagesByRoomId,
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

export const useMessages = (roomId: string | null | undefined) => {
  const { data, error, isLoading, isValidating, mutate, size, setSize } =
    useSWRInfinite<OptimisticMessage[]>(
      getMessagesKey(roomId),
      ([, , cursor]: NonNullable<MessagesKey>) =>
        getMessagesByRoomId(roomId!, cursor) as Promise<OptimisticMessage[]>,
    );

  // Server returns DESC by `created_at`; flatten reverse to ASC (oldest top,
  // newest bottom). Dedup by id covers page boundary overlap when two cursors
  // share the same `created_at`.
  const messages = useMemo(() => {
    if (!data) return [];
    const seenIds = new Set<string>();
    const ascending: OptimisticMessage[] = [];
    for (let i = data.length - 1; i >= 0; i--) {
      const page = data[i];
      for (let j = page.length - 1; j >= 0; j--) {
        const message = page[j];
        if (seenIds.has(message.id)) continue;
        seenIds.add(message.id);
        ascending.push(message);
      }
    }
    return ascending;
  }, [data]);

  // `hasMore` counts server rows only — optimistic temps (have `tempId`) are
  // excluded so an inserted temp can't make page length ≠ PAGE_SIZE and hide
  // the "Load older" button.
  const lastPage = data?.[data.length - 1];
  const lastServerPageLen =
    lastPage?.filter((message) => !message.tempId).length ?? 0;
  const hasMore = lastPage ? lastServerPageLen === MESSAGE_PAGE_SIZE : false;
  const isLoadingMore =
    isValidating && data !== undefined && size > data.length;
  const isEmpty = !isLoading && messages.length === 0 && !error;

  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) setSize(size + 1);
  }, [hasMore, isLoadingMore, size, setSize]);

  const retry = useCallback(() => mutate(), [mutate]);

  return {
    messages,
    error,
    isLoading,
    isLoadingMore,
    isEmpty,
    hasMore,
    loadMore,
    retry,
  };
};
