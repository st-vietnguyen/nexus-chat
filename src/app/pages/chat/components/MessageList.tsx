import { useTranslation } from 'react-i18next';
import { useAuth } from '@app/shared/contexts/auth.context';
import { useMessages } from '@app/shared/hooks/data/useMessages';
import { MessageItem } from './MessageItem';
import { MessageListSkeleton } from './MessageListSkeleton';
import { MessageListStatus } from './MessageListStatus';

interface MessageListProps {
  roomId: string | null;
}

export const MessageList = ({ roomId }: MessageListProps) => {
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

  if (!roomId) return null;

  if (isLoading) return <MessageListSkeleton />;

  if (error) {
    return (
      <MessageListStatus
        variant="error"
        message={t('messages.error')}
        action={
          <button type="button" className="btn" onClick={() => retry()}>
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
    <ul className="message-list">
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
          isOwn={message.sender_id === user?.id}
        />
      ))}
    </ul>
  );
};
