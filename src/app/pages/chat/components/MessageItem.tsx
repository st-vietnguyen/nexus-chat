import type { Message } from '@app/core/services/message.service';
import { formatTime } from '@core/helpers/date.helper';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
}

export const MessageItem = ({ message, isOwn }: MessageItemProps) => {
  const rowClass = `message-row ${isOwn ? 'message-row-own' : 'message-row-other'}`;
  const bubbleClass = `message-bubble ${isOwn ? 'message-bubble-own' : 'message-bubble-other'}`;

  return (
    <li className={rowClass}>
      <div className={bubbleClass}>
        <p className="message-bubble-text">{message.content}</p>
        <span className="message-bubble-time">
          {formatTime(message.created_at)}
        </span>
      </div>
    </li>
  );
};
