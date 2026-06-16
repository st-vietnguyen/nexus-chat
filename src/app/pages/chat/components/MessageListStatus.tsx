import { ReactNode } from 'react';

type Variant = 'info' | 'error';

interface MessageListStatusProps {
  variant?: Variant;
  message: string;
  action?: ReactNode;
}

export const MessageListStatus = ({
  variant = 'info',
  message,
  action,
}: MessageListStatusProps) => {
  const classNames = `message-list-status${variant === 'error' ? ' message-list-status-error' : ''}`;

  return (
    <div className={classNames}>
      <p>{message}</p>
      {action}
    </div>
  );
};
