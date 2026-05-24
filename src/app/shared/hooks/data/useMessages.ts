import { useCallback, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import {
  MESSAGE_PAGE_SIZE,
  getMessagesByRoomId,
  type Message,
} from '@app/core/services/message.service';

type Key = readonly ['messages', string, string | undefined] | null;

const getKey =
  (roomId: string | null | undefined) =>
  (pageIndex: number, previousPageData: Message[] | null): Key => {
    if (!roomId) return null;
    if (previousPageData && previousPageData.length === 0) return null;

    if (pageIndex === 0) return ['messages', roomId, undefined];

    const cursor = previousPageData?.[previousPageData.length - 1]?.created_at;
    return ['messages', roomId, cursor];
  };

export const useMessages = (roomId: string | null | undefined) => {
  const { data, error, isLoading, isValidating, mutate, size, setSize } =
    useSWRInfinite<Message[]>(
      getKey(roomId),
      ([, , cursor]: NonNullable<Key>) => getMessagesByRoomId(roomId!, cursor),
    );

  const messages = useMemo(() => {
    if (!data) return [];
    const seen = new Set<string>();
    const ascending: Message[] = [];
    for (let i = data.length - 1; i >= 0; i--) {
      const page = data[i];
      for (let j = page.length - 1; j >= 0; j--) {
        const msg = page[j];
        if (seen.has(msg.id)) continue;
        seen.add(msg.id);
        ascending.push(msg);
      }
    }
    return ascending;
  }, [data]);

  const lastPage = data?.[data.length - 1];
  const hasMore = lastPage ? lastPage.length === MESSAGE_PAGE_SIZE : false;
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
