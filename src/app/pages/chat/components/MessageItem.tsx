import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MESSAGE_DELIVERY_STATUS,
  MESSAGE_TYPE,
  type OptimisticMessage,
} from '@app/core/services/message.service';
import { resolveMessageImageSrc } from '@app/core/services/image.service';
import {
  useImagePreview,
  type PreviewImage,
} from '@app/shared/contexts/image-preview.context';
import { formatTime } from '@core/helpers/date.helper';
import AlertErrorIcon from '@assets/icons/ic-alert-error.svg?react';
import { Button } from '@app/shared/components/partials';

interface MessageItemProps {
  message: OptimisticMessage;
  isOwn: boolean;
  onRetry?: (tempId: string) => void;
  galleryImages?: PreviewImage[];
}

const ImageBubble = ({
  message,
  isOwn,
  isPending,
  altFallback,
  galleryImages,
}: {
  message: OptimisticMessage;
  isOwn: boolean;
  isPending: boolean;
  altFallback: string;
  galleryImages?: PreviewImage[];
}) => {
  const { openPreview } = useImagePreview();
  const src = useMemo(() => resolveMessageImageSrc(message), [message]);

  const bubbleClass = [
    'message-image-bubble',
    isOwn ? 'message-image-bubble-own' : 'message-image-bubble-other',
    isPending && 'message-image-bubble-pending',
  ]
    .filter(Boolean)
    .join(' ');

  const handleOpen = () => {
    if (!src || isPending) return;
    openPreview(
      {
        id: message.id,
        url: src,
        alt: message.fileName ?? altFallback,
      },
      galleryImages?.length ? { images: galleryImages } : undefined,
    );
  };

  return (
    <div className={bubbleClass}>
      {src ? (
        <button
          type="button"
          className="message-image-bubble-trigger"
          onClick={handleOpen}
          disabled={isPending}
        >
          <img
            src={src}
            alt={message.fileName ?? altFallback}
            className="message-image-bubble-img"
            loading="lazy"
          />
        </button>
      ) : (
        <div className="message-image-bubble-placeholder" />
      )}
      <span className="message-image-bubble-time">
        {formatTime(message.createdAt)}
      </span>
    </div>
  );
};

export const MessageItem = ({
  message,
  isOwn,
  onRetry,
  galleryImages,
}: MessageItemProps) => {
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
              galleryImages={galleryImages}
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
          <span className="message-row-caption message-row-caption-pending">
            {t('messages.sending')}
          </span>
        )}
        {canRetry && (
          <Button
            type="button"
            variant="ghost"
            className="message-row-caption message-row-caption-failed"
            onClick={handleRetry}
          >
            {t('messages.failedTapRetry')}
          </Button>
        )}
      </div>
    </li>
  );
};
