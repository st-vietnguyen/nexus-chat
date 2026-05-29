import { useCallback, useRef, useState } from 'react';
import { useSWRConfig } from 'swr';
// eslint-disable-next-line camelcase -- exported by swr/infinite
import { unstable_serialize } from 'swr/infinite';
import { useAuth } from '@app/shared/contexts/auth.context';
import {
  sendMessage,
  MESSAGE_DELIVERY_STATUS,
  type OptimisticMessage,
} from '@app/core/services/message.service';
import { getMessagesKey } from './useMessages';
import { RECONCILE_WINDOW_MS, sortPageDesc } from './reconcileMessages';

const makeTempId = () =>
  `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const buildTempMessage = (
  roomId: string,
  senderId: string,
  content: string,
): OptimisticMessage => {
  const tempId = makeTempId();

  return {
    id: tempId,
    tempId,
    // eslint-disable-next-line camelcase -- matches Postgres column name
    room_id: roomId,
    // eslint-disable-next-line camelcase -- matches Postgres column name
    sender_id: senderId,
    content,
    // eslint-disable-next-line camelcase -- matches Postgres column name
    created_at: new Date().toISOString(),
    status: MESSAGE_DELIVERY_STATUS.SENDING,
  };
};

const mapByTempId = (
  pages: OptimisticMessage[][],
  tempId: string,
  patch: (msg: OptimisticMessage) => OptimisticMessage,
): OptimisticMessage[][] =>
  pages.map((page) =>
    page.map((msg) => (msg.tempId === tempId ? patch(msg) : msg)),
  );

export const useSendMessage = (roomId: string | null | undefined) => {
  const { mutate, cache } = useSWRConfig();
  const { user } = useAuth();
  const [inFlightCount, setInFlightCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const inFlightRef = useRef<Set<string>>(new Set());

  const runSend = useCallback(
    async (
      key: string,
      tempId: string,
      content: string,
    ): Promise<OptimisticMessage | null> => {
      if (!roomId || !user) return null;
      if (inFlightRef.current.has(tempId)) return null;
      inFlightRef.current.add(tempId);
      setInFlightCount((count) => count + 1);
      setError(null);

      try {
        const real = await sendMessage({ roomId, senderId: user.id, content });
        const sent: OptimisticMessage = {
          ...real,
          status: MESSAGE_DELIVERY_STATUS.SENT,
        };

        await mutate(
          key,
          (pages: OptimisticMessage[][] = [[]]) => {
            let replacedPageIdx = -1;
            const next = pages.map((page, pageIdx) =>
              page.flatMap<OptimisticMessage>((msg) => {
                if (msg.tempId === tempId) {
                  replacedPageIdx = pageIdx;
                  return [sent];
                }
                if (msg.id === real.id) return [];
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
          },
          { revalidate: false },
        );

        return sent;
      } catch (err) {
        const caughtError = err instanceof Error ? err : new Error(String(err));
        setError(caughtError);

        await mutate(
          key,
          (pages: OptimisticMessage[][] = []) =>
            mapByTempId(pages, tempId, (msg) => ({
              ...msg,
              status: MESSAGE_DELIVERY_STATUS.FAILED,
            })),
          { revalidate: false },
        );

        // Failure is surfaced via the message's FAILED status and the hook's
        // `error` state. Returning null lets callers `void send(...)` without
        // needing a noop `.catch`.
        return null;
      } finally {
        inFlightRef.current.delete(tempId);
        setInFlightCount((count) => Math.max(0, count - 1));
      }
    },
    [mutate, roomId, user],
  );

  const send = useCallback(
    async (content: string): Promise<OptimisticMessage | null> => {
      const trimmed = content.trim();
      if (!trimmed || !roomId || !user) return null;

      const key = unstable_serialize(getMessagesKey(roomId));
      const temp = buildTempMessage(roomId, user.id, trimmed);

      // Seed optimistic temp into page[0]. Works even when cache is empty
      // (pages defaults to [[]]) so the SENDING bubble shows immediately on
      // the very first send before any history fetch completes.
      // Do NOT await: the synchronous updater writes cache before returning,
      // and awaiting the resulting Promise can stall when no SWR hook is yet
      // subscribed to this infinite key on first room visit — which prevents
      // runSend (and thus the RPC) from ever firing.
      void mutate(
        key,
        (pages: OptimisticMessage[][] = [[]]) => {
          const next = pages.length ? [...pages] : [[]];
          next[0] = [temp, ...(next[0] ?? [])];
          return next;
        },
        { revalidate: false },
      );

      return runSend(key, temp.tempId as string, trimmed);
    },
    [mutate, roomId, user, runSend],
  );

  const retry = useCallback(
    async (tempId: string): Promise<OptimisticMessage | null> => {
      if (!roomId || !tempId) return null;
      if (inFlightRef.current.has(tempId)) return null;

      const key = unstable_serialize(getMessagesKey(roomId));
      const cached = cache.get(key)?.data as OptimisticMessage[][] | undefined;
      const flat = cached?.flat() ?? [];
      const target = flat.find((msg) => msg.tempId === tempId);

      if (!target || target.status !== MESSAGE_DELIVERY_STATUS.FAILED) {
        return null;
      }

      // If a real message with the same sender + trimmed content already exists
      // in cache within the reconcile window, the original RPC committed
      // server-side despite the client-side failure. Drop the FAILED temp
      // instead of resending to avoid persisting a duplicate row.
      const trimmedContent = target.content.trim();
      const targetTime = new Date(target.created_at).getTime();
      const duplicate = flat.find(
        (msg) =>
          !msg.tempId &&
          msg.sender_id === target.sender_id &&
          msg.content.trim() === trimmedContent &&
          Math.abs(new Date(msg.created_at).getTime() - targetTime) <=
            RECONCILE_WINDOW_MS,
      );
      if (duplicate) {
        await mutate(
          key,
          (pages: OptimisticMessage[][] = []) =>
            pages.map((page) => page.filter((m) => m.tempId !== tempId)),
          { revalidate: false },
        );
        return { ...duplicate, status: MESSAGE_DELIVERY_STATUS.SENT };
      }

      const content = target.content;

      await mutate(
        key,
        (pages: OptimisticMessage[][] = []) =>
          mapByTempId(pages, tempId, (msg) => ({
            ...msg,
            status: MESSAGE_DELIVERY_STATUS.SENDING,
          })),
        { revalidate: false },
      );

      return runSend(key, tempId, content);
    },
    [cache, mutate, roomId, runSend],
  );

  return { send, retry, isSending: inFlightCount > 0, error };
};
