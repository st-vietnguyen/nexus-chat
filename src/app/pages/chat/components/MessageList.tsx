import { useTranslation } from 'react-i18next';
import { useAuth } from '@app/shared/contexts/auth.context';
import { Button } from '@app/shared/components/partials';
import { useMessages } from '@app/shared/hooks/data/useMessages';
import { useMessageListScroll } from '../hooks/useMessageListScroll';
import { MessageItem } from './MessageItem';
import { MessageListSkeleton } from './MessageListSkeleton';
import { MessageListStatus } from './MessageListStatus';

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

  if (!roomId) return null;

  if (isLoading) return <MessageListSkeleton />;

  if (error) {
    return (
      <MessageListStatus
        variant="error"
        message={t('messages.error')}
        action={
          <Button type="button" className="btn-primary btn-sm" onClick={retry}>
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
        />
      ))}
    </ul>
  );
};
