import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@app/shared/contexts/auth.context';
import { Button } from '@app/shared/components/partials';
import { useMessages } from '@app/shared/hooks/data/useMessages';
import {
  MESSAGE_TYPE,
  type OptimisticMessage,
} from '@app/core/services/message.service';
import { resolveMessageImageSrc } from '@app/core/services/image.service';
import type { PreviewImage } from '@app/shared/contexts/image-preview.context';
import { useMessageListScroll } from '../hooks/useMessageListScroll';
import { MessageItem } from './MessageItem';
import { MessageListSkeleton } from './MessageListSkeleton';
import { MessageListStatus } from './MessageListStatus';

const buildImageGallery = (messages: OptimisticMessage[]): PreviewImage[] =>
  messages.reduce<PreviewImage[]>((acc, message) => {
    if (message.type !== MESSAGE_TYPE.IMAGE) return acc;
    const url = resolveMessageImageSrc(message);
    if (!url) return acc;
    acc.push({
      id: message.id,
      url,
      alt: message.fileName ?? undefined,
    });
    return acc;
  }, []);

interface MessageListProps {
  roomId: string | null;
  onRetry?: (tempId: string) => void;
}

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

  const listRef = useMessageListScroll({
    roomId,
    messages,
    currentUserId: user?.id,
    hasMore,
    isLoadingMore,
    loadMore,
  });

  const galleryImages = useMemo(() => buildImageGallery(messages), [messages]);

  if (!roomId) return null;

  if (isLoading) return <MessageListSkeleton />;

  if (error) {
    return (
      <MessageListStatus
        variant="error"
        message={t('messages.error')}
        action={
          <Button
            type="button"
            variant="primary"
            className="btn-sm"
            onClick={retry}
          >
            {t('messages.retry')}
          </Button>
        }
      />
    );
  }

  if (isEmpty) {
    return <MessageListStatus message={t('messages.empty')} />;
  }

  return (
    <ul className="message-list" ref={listRef}>
      {isLoadingMore && (
        <li className="message-list-load-more">
          <span className="message-list-load-more-status">
            {t('messages.loadingMore')}
          </span>
        </li>
      )}
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isOwn={message.senderId === user?.id}
          onRetry={onRetry}
          galleryImages={galleryImages}
        />
      ))}
    </ul>
  );
};
