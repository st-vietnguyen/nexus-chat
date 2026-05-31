import { useEffect, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@app/shared/contexts/auth.context';
import { useMessages } from '@app/shared/hooks/data/useMessages';
import { MessageItem } from './MessageItem';
import { MessageListSkeleton } from './MessageListSkeleton';
import { MessageListStatus } from './MessageListStatus';

interface MessageListProps {
  roomId: string | null;
  onRetry?: (tempId: string) => void;
}

const NEAR_BOTTOM_THRESHOLD = 120;

export const MessageList = ({ roomId, onRetry }: MessageListProps) => {
  const { t } = useTranslation('chat');
  const { user } = useAuth();
  const {
    messages,
    error,
    isLoading,
    isLoadingMore,
    isEmpty,
    hasMore,
    loadMore,
    retry,
  } = useMessages(roomId);

  const listRef = useRef<HTMLUListElement>(null);
  // Tracks whether user is near bottom. Auto-scroll on incoming messages
  // from others only when true; own messages always scroll to bottom.
  const isAtBottomRef = useRef(true);
  // Prior-render snapshot for detecting prepend (firstId change) vs append
  // (lastId change), and computing scrollHeight delta on prepend to keep
  // the user's reading position fixed.
  const prevSigRef = useRef<{
    roomId: string | null;
    lastId?: string;
    firstId?: string;
    scrollHeight: number;
  }>({ roomId: null, scrollHeight: 0 });

  const hasMessages = messages.length > 0;

  // Bind scroll listener to <ul>'s parent (the overflow container). Deps
  // include `hasMessages` and `roomId` so the effect re-runs when the <ul>
  // mounts after the skeleton, or when the parent re-instances on room change.
  useEffect(() => {
    const root = listRef.current?.parentElement;
    if (!root) return;

    const onScroll = () => {
      const distance = root.scrollHeight - root.scrollTop - root.clientHeight;
      isAtBottomRef.current = distance < NEAR_BOTTOM_THRESHOLD;
    };

    root.addEventListener('scroll', onScroll, { passive: true });
    return () => root.removeEventListener('scroll', onScroll);
  }, [hasMessages, roomId]);

  // useLayoutEffect (not useEffect) so scrollTop is adjusted before paint —
  // avoids visible jump when prepending older messages.
  useLayoutEffect(() => {
    const root = listRef.current?.parentElement;
    if (!root) return;

    const lastId = messages[messages.length - 1]?.id;
    const firstId = messages[0]?.id;
    const newLast = messages[messages.length - 1];
    const isOwnNewLast = !!newLast && newLast.senderId === user?.id;
    const prev = prevSigRef.current;
    const roomChanged = prev.roomId !== roomId;

    if (roomChanged) {
      // Room switched: snap to bottom, no animation.
      isAtBottomRef.current = true;
      if (lastId) {
        root.scrollTop = root.scrollHeight;
      }
    } else if (lastId) {
      // Classify change by boundary ids.
      //   didPrepend — older messages inserted at top (load older).
      //   didAppend  — new message at bottom (send/receive).
      const didPrepend = !!prev.firstId && firstId !== prev.firstId;
      const didAppend = !!prev.lastId && lastId !== prev.lastId;

      if (didPrepend) {
        // Offset scrollTop by added height so reading position stays put.
        // Checked before append to avoid being yanked to bottom.
        const delta = root.scrollHeight - prev.scrollHeight;
        if (delta > 0) root.scrollTop += delta;
      } else if (!prev.lastId) {
        // First batch (post-skeleton): jump to bottom, no smooth.
        root.scrollTop = root.scrollHeight;
        isAtBottomRef.current = true;
      } else if (didAppend) {
        // scrollHeight unchanged → temp→real id swap (same content, same
        // height). Skip to avoid interrupting in-flight smooth scroll from
        // the original optimistic append.
        const heightChanged = root.scrollHeight !== prev.scrollHeight;
        if (heightChanged && (isOwnNewLast || isAtBottomRef.current)) {
          root.scrollTo({ top: root.scrollHeight, behavior: 'smooth' });
        }
      }
    }

    // Persist snapshot for next render (after scrollTop adjustment so the
    // next delta calculation is accurate).
    prevSigRef.current = {
      roomId,
      lastId,
      firstId,
      scrollHeight: root.scrollHeight,
    };
  }, [messages, roomId, user?.id]);

  if (!roomId) return null;

  if (isLoading) return <MessageListSkeleton />;

  if (error) {
    return (
      <MessageListStatus
        variant="error"
        message={t('messages.error')}
        action={
          <button type="button" className="btn" onClick={retry}>
            {t('messages.retry')}
          </button>
        }
      />
    );
  }

  if (isEmpty) {
    return <MessageListStatus message={t('messages.empty')} />;
  }

  return (
    <ul className="message-list" ref={listRef}>
      {hasMore && (
        <li className="message-list-load-more">
          <button
            type="button"
            className="message-list-load-more-btn"
            onClick={loadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore
              ? t('messages.loadingMore')
              : t('messages.loadOlder')}
          </button>
        </li>
      )}
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isOwn={message.senderId === user?.id}
          onRetry={onRetry}
        />
      ))}
    </ul>
  );
};
