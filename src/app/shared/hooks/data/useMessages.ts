import { useCallback, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import {
  MESSAGE_PAGE_SIZE,
  getMessagesByRoomId,
  type OptimisticMessage,
} from '@app/core/services/message.service';
import { getMessagesKey, type MessagesKey } from '@shared/utils/message';

export const useMessages = (roomId: string | null | undefined) => {
  const { data, error, isLoading, isValidating, mutate, size, setSize } =
    useSWRInfinite<OptimisticMessage[]>(
      getMessagesKey(roomId),
      ([, , cursor]: NonNullable<MessagesKey>) =>
        getMessagesByRoomId(roomId!, cursor) as Promise<OptimisticMessage[]>,
    );

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
