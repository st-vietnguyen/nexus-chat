import { useCallback, useRef, useState } from 'react';
import { useSWRConfig } from 'swr';
// eslint-disable-next-line camelcase -- exported by swr/infinite
import { unstable_serialize } from 'swr/infinite';
import { useAuth } from '@app/shared/contexts/auth.context';
import {
  sendMessage,
  sendImageMessage,
  MESSAGE_DELIVERY_STATUS,
  MESSAGE_TYPE,
  type OptimisticMessage,
} from '@app/core/services/message.service';
import {
  uploadChatImage,
  validateChatImage,
  ImageValidationError,
} from '@app/core/services/image.service';
import {
  RECONCILE_WINDOW_MS,
  buildTempMessage,
  getMessagesKey,
  mapByTempId,
  prependTemp,
  replaceTempWithSent,
} from '@shared/utils/message';

export const useSendMessage = (roomId: string | null | undefined) => {
  const { mutate, cache } = useSWRConfig();
  const { user } = useAuth();
  const [error, setError] = useState<Error | null>(null);
  const inFlightRef = useRef<Set<string>>(new Set());
  const pendingImageFiles = useRef<Map<string, File>>(new Map());

  const runOptimisticSend = useCallback(
    async (
      key: string,
      tempId: string,
      perform: () => Promise<OptimisticMessage>,
    ): Promise<OptimisticMessage | null> => {
      if (!roomId || !user) return null;
      if (inFlightRef.current.has(tempId)) return null;
      inFlightRef.current.add(tempId);
      setError(null);

      try {
        const sent = await perform();
        await mutate(
          key,
          (pages: OptimisticMessage[][] = [[]]) =>
            replaceTempWithSent(pages, tempId, sent),
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
        return null;
      } finally {
        inFlightRef.current.delete(tempId);
      }
    },
    [mutate, roomId, user],
  );

  const performTextSend = useCallback(
    async (content: string): Promise<OptimisticMessage> => {
      if (!roomId || !user) throw new Error('missing room or user');
      const real = await sendMessage({ roomId, senderId: user.id, content });
      return { ...real, status: MESSAGE_DELIVERY_STATUS.SENT };
    },
    [roomId, user],
  );

  const performImageSend = useCallback(
    async (
      key: string,
      tempId: string,
      file: File,
      localImageUrl: string,
    ): Promise<OptimisticMessage> => {
      if (!roomId || !user) throw new Error('missing room or user');

      const storagePath = await uploadChatImage(roomId, user.id, file);

      // Patch temp with storagePath so realtime reconciliation can match it
      await mutate(
        key,
        (pages: OptimisticMessage[][] = []) =>
          mapByTempId(pages, tempId, (msg) => ({ ...msg, storagePath })),
        { revalidate: false },
      );

      const real = await sendImageMessage({
        roomId,
        storagePath,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });

      pendingImageFiles.current.delete(tempId);
      URL.revokeObjectURL(localImageUrl);

      return {
        ...real,
        status: MESSAGE_DELIVERY_STATUS.SENT,
      };
    },
    [mutate, roomId, user],
  );

  const send = useCallback(
    async (content: string): Promise<OptimisticMessage | null> => {
      const trimmed = content.trim();
      if (!trimmed || !roomId || !user) return null;

      const key = unstable_serialize(getMessagesKey(roomId));
      const temp = buildTempMessage(roomId, user.id, {
        content: trimmed,
        type: MESSAGE_TYPE.TEXT,
      });

      // Sync mutate (no await): writes cache before runOptimisticSend so the
      // SENDING bubble shows immediately even when no SWR subscriber exists
      // for this key yet. Awaiting can stall on first room visit.
      mutate(
        key,
        (pages: OptimisticMessage[][] = [[]]) => prependTemp(pages, temp),
        {
          revalidate: false,
        },
      );

      return runOptimisticSend(key, temp.tempId as string, () =>
        performTextSend(trimmed),
      );
    },
    [mutate, roomId, user, runOptimisticSend, performTextSend],
  );

  const sendImage = useCallback(
    async (file: File): Promise<OptimisticMessage | null> => {
      if (!roomId || !user) return null;

      try {
        validateChatImage(file);
      } catch (err) {
        if (err instanceof ImageValidationError) {
          setError(err);
          return null;
        }
        throw err;
      }

      const localImageUrl = URL.createObjectURL(file);
      const key = unstable_serialize(getMessagesKey(roomId));
      const temp = buildTempMessage(roomId, user.id, {
        type: MESSAGE_TYPE.IMAGE,
        localImageUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });

      pendingImageFiles.current.set(temp.tempId as string, file);

      mutate(
        key,
        (pages: OptimisticMessage[][] = [[]]) => prependTemp(pages, temp),
        {
          revalidate: false,
        },
      );

      return runOptimisticSend(key, temp.tempId as string, () =>
        performImageSend(key, temp.tempId as string, file, localImageUrl),
      );
    },
    [mutate, roomId, user, runOptimisticSend, performImageSend],
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

      if (target.type === MESSAGE_TYPE.IMAGE) {
        const file = pendingImageFiles.current.get(tempId);
        if (!file) return null;

        // Revoke any prior URL before allocating a new one to avoid leak
        if (target.localImageUrl) URL.revokeObjectURL(target.localImageUrl);
        const localImageUrl = URL.createObjectURL(file);

        await mutate(
          key,
          (pages: OptimisticMessage[][] = []) =>
            mapByTempId(pages, tempId, (msg) => ({
              ...msg,
              status: MESSAGE_DELIVERY_STATUS.SENDING,
              localImageUrl,
            })),
          { revalidate: false },
        );

        return runOptimisticSend(key, tempId, () =>
          performImageSend(key, tempId, file, localImageUrl),
        );
      }

      const trimmedContent = target.content.trim();
      const targetTime = new Date(target.createdAt).getTime();
      const duplicate = flat.find(
        (msg) =>
          !msg.tempId &&
          msg.senderId === target.senderId &&
          msg.content.trim() === trimmedContent &&
          Math.abs(new Date(msg.createdAt).getTime() - targetTime) <=
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

      return runOptimisticSend(key, tempId, () => performTextSend(content));
    },
    [
      cache,
      mutate,
      roomId,
      runOptimisticSend,
      performTextSend,
      performImageSend,
    ],
  );

  return { send, sendImage, retry, error };
};
