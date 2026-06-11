import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MESSAGE_DELIVERY_STATUS,
  MESSAGE_TYPE,
  type OptimisticMessage,
} from '@app/core/services/message.service';
import { getChatImagePublicUrl } from '@app/core/services/image.service';
import { formatTime } from '@core/helpers/date.helper';
import AlertErrorIcon from '@assets/icons/ic-alert-error.svg?react';

interface MessageItemProps {
  message: OptimisticMessage;
  isOwn: boolean;
  onRetry?: (tempId: string) => void;
}

const ImageBubble = ({
  message,
  isOwn,
  isPending,
  altFallback,
}: {
  message: OptimisticMessage;
  isOwn: boolean;
  isPending: boolean;
  altFallback: string;
}) => {
  const src = useMemo(
    () =>
      message.localImageUrl ??
      (message.storagePath ? getChatImagePublicUrl(message.storagePath) : null),
    [message.localImageUrl, message.storagePath],
  );

  const bubbleClass = [
    'message-image-bubble',
    isOwn ? 'message-image-bubble-own' : 'message-image-bubble-other',
    isPending && 'message-image-bubble-pending',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={bubbleClass}>
      {src ? (
        <img
          src={src}
          alt={message.fileName ?? altFallback}
          className="message-image-bubble-img"
          loading="lazy"
        />
      ) : (
        <div className="message-image-bubble-placeholder" />
      )}
      <span className="message-image-bubble-time">
        {formatTime(message.createdAt)}
      </span>
    </div>
  );
};

export const MessageItem = ({ message, isOwn, onRetry }: MessageItemProps) => {
  const { t } = useTranslation('chat');
  const isPending = message.status === MESSAGE_DELIVERY_STATUS.SENDING;
  const isFailed = message.status === MESSAGE_DELIVERY_STATUS.FAILED;
  const canRetry = isOwn && isFailed && !!message.tempId && !!onRetry;
  const isImage = message.type === MESSAGE_TYPE.IMAGE;

  const rowClass = `message-row ${isOwn ? 'message-row-own' : 'message-row-other'}`;
  const bubbleClass = [
    'message-bubble',
    isOwn ? 'message-bubble-own' : 'message-bubble-other',
    isPending && 'message-bubble-pending',
  ]
    .filter(Boolean)
    .join(' ');

  const handleRetry = () => {
    if (!canRetry || !message.tempId) return;
    onRetry?.(message.tempId);
  };

  return (
    <li className={rowClass}>
      <div className="message-row-content">
        <div className="message-row-bubble-wrap">
          {canRetry && (
            <AlertErrorIcon
              className="message-row-error-icon"
              aria-hidden="true"
            />
          )}
          {isImage ? (
            <ImageBubble
              message={message}
              isOwn={isOwn}
              isPending={isPending}
              altFallback={t('messages.imageAlt')}
            />
          ) : (
            <div className={bubbleClass}>
              <p className="message-bubble-text">{message.content}</p>
              <span className="message-bubble-time">
                {formatTime(message.createdAt)}
              </span>
            </div>
          )}
        </div>
        {isOwn && isPending && (
          <span
            className="message-row-caption message-row-caption-pending"
            role="status"
            aria-live="polite"
          >
            {t('messages.sending')}
          </span>
        )}
        {canRetry && (
          <button
            type="button"
            className="message-row-caption message-row-caption-failed"
            onClick={handleRetry}
            aria-label={t('messages.retry')}
          >
            {t('messages.failedTapRetry')}
          </button>
        )}
      </div>
    </li>
  );
};
