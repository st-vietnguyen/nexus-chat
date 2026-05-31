import { useEffect, useLayoutEffect, useRef } from 'react';
import type { OptimisticMessage } from '@app/core/services/message.service';

interface UseMessageListScrollParams {
  roomId: string | null;
  messages: OptimisticMessage[];
  currentUserId: string | undefined;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
}

const NEAR_BOTTOM_THRESHOLD = 120;
const NEAR_TOP_THRESHOLD = 120;

export const useMessageListScroll = ({
  roomId,
  messages,
  currentUserId,
  hasMore,
  isLoadingMore,
  loadMore,
}: UseMessageListScrollParams) => {
  const listRef = useRef<HTMLUListElement>(null);
  // Latest values for scroll handler without rebinding listener each render.
  const loadMoreRef = useRef(loadMore);
  const hasMoreRef = useRef(hasMore);
  const isLoadingMoreRef = useRef(isLoadingMore);
  loadMoreRef.current = loadMore;
  hasMoreRef.current = hasMore;
  isLoadingMoreRef.current = isLoadingMore;
  // In-flight guard. SWR's `isLoadingMore` lags one render after `setSize`,
  // so without this both the scroll handler and the layout effect can fire
  // `loadMore` for the same page before SWR reflects the pending fetch.
  // Cleared when `messages` identity changes (new page arrived).
  const loadMorePendingRef = useRef(false);

  const triggerLoadMore = () => {
    if (
      loadMorePendingRef.current ||
      !hasMoreRef.current ||
      isLoadingMoreRef.current
    ) {
      return;
    }
    loadMorePendingRef.current = true;
    loadMoreRef.current();
  };
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

  // Rebind when <ul> mounts post-skeleton or parent re-instances on room change.
  useEffect(() => {
    const root = listRef.current?.parentElement;
    if (!root) return;

    const onScroll = () => {
      const distance = root.scrollHeight - root.scrollTop - root.clientHeight;
      isAtBottomRef.current = distance < NEAR_BOTTOM_THRESHOLD;
      if (root.scrollTop < NEAR_TOP_THRESHOLD) {
        triggerLoadMore();
      }
    };

    root.addEventListener('scroll', onScroll, { passive: true });
    return () => root.removeEventListener('scroll', onScroll);
  }, [hasMessages, roomId]);

  // useLayoutEffect (not useEffect) so scrollTop is adjusted before paint —
  // avoids visible jump when prepending older messages.
  useLayoutEffect(() => {
    const root = listRef.current?.parentElement;
    if (!root) return;

    // `messages` identity changed → SWR response landed (or room switch).
    // Release in-flight guard so next trigger can fire.
    loadMorePendingRef.current = false;

    const lastId = messages[messages.length - 1]?.id;
    const firstId = messages[0]?.id;
    const newLast = messages[messages.length - 1];
    const isOwnNewLast = !!newLast && newLast.senderId === currentUserId;
    const prev = prevSigRef.current;
    const roomChanged = prev.roomId !== roomId;

    if (roomChanged) {
      isAtBottomRef.current = true;
      if (lastId) {
        root.scrollTop = root.scrollHeight;
      }
    } else if (lastId) {
      const didPrepend = !!prev.firstId && firstId !== prev.firstId;
      const didAppend = !!prev.lastId && lastId !== prev.lastId;

      if (didPrepend) {
        const delta = root.scrollHeight - prev.scrollHeight;
        if (delta > 0) root.scrollTop += delta;
      } else if (!prev.lastId) {
        root.scrollTop = root.scrollHeight;
        isAtBottomRef.current = true;
      } else if (didAppend) {
        // scrollHeight unchanged → temp→real id swap (same content/height).
        // Skip to avoid interrupting in-flight smooth scroll.
        const heightChanged = root.scrollHeight !== prev.scrollHeight;
        if (heightChanged && (isOwnNewLast || isAtBottomRef.current)) {
          root.scrollTo({ top: root.scrollHeight, behavior: 'smooth' });
        }
      }
    }

    // Content shorter than viewport → no scroll event fires; trigger load
    // directly so pagination still progresses.
    const isContentShort =
      root.scrollHeight <= root.clientHeight + NEAR_TOP_THRESHOLD;
    if (isContentShort) {
      triggerLoadMore();
    }

    prevSigRef.current = {
      roomId,
      lastId,
      firstId,
      scrollHeight: root.scrollHeight,
    };
  }, [messages, roomId, currentUserId]);

  return listRef;
};
