import { useCallback } from 'react';
import { useAuth } from '@app/shared/contexts/auth.context';
import { useSendMessage } from '@app/shared/hooks/data/useSendMessage';
import { useRoomMessagesRealtime } from '@app/shared/hooks/data/useRoomMessagesRealtime';
import { useMarkRoomRead } from '@app/shared/hooks/data/useMarkRoomRead';
import { useTypingIndicator } from '@app/shared/hooks/data/useTypingIndicator';
import type { Message } from '@app/core/services/message.service';
import { ChatRoomHeader } from './ChatRoomHeader';
import { MessageList } from './MessageList';
import { MessageCompose } from './MessageCompose';
import { TypingIndicator } from './TypingIndicator';

interface ChatRoomPanelProps {
  roomId: string;
}

export const ChatRoomPanel = ({ roomId }: ChatRoomPanelProps) => {
  const { user } = useAuth();
  const { send, retry } = useSendMessage(roomId);
  // Marks on mount and on each room change so reopening a room from the URL
  // also clears the badge. Returned mark is reused for incoming-while-open.
  const markRead = useMarkRoomRead(roomId);
  const handleIncoming = useCallback(
    (message: Message) => {
      // Own messages already keep unread at 0 in the list reducer.
      if (message.sender_id === user?.id) return;
      markRead();
    },
    [markRead, user?.id],
  );
  useRoomMessagesRealtime(roomId, { onIncoming: handleIncoming });
  const { typingUserIds, notifyTyping } = useTypingIndicator(roomId);

  return (
    <section className="chat-panel chat-panel-active" aria-live="polite">
      <ChatRoomHeader roomId={roomId} />
      <div className="chat-panel-body">
        <MessageList roomId={roomId} onRetry={retry} />
        <TypingIndicator count={typingUserIds.length} />
      </div>
      <MessageCompose onSend={send} onTyping={notifyTyping} />
    </section>
  );
};
