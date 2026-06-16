import { useCallback, useMemo } from 'react';
import { useAuth } from '@app/shared/contexts/auth.context';
import { useSendMessage } from '@app/shared/hooks/data/useSendMessage';
import { useRoomMessagesRealtime } from '@app/shared/hooks/data/useRoomMessagesRealtime';
import { useMarkRoomRead } from '@app/shared/hooks/data/useMarkRoomRead';
import { useTypingIndicator } from '@app/shared/hooks/data/useTypingIndicator';
import { useJoinedRooms } from '@app/shared/hooks/data/useJoinedRooms';
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
  const { send, sendImage, retry } = useSendMessage(roomId);
  const { data: rooms } = useJoinedRooms();
  const room = useMemo(
    () => rooms?.find((r) => r.id === roomId),
    [rooms, roomId],
  );
  const markRead = useMarkRoomRead(roomId);
  const handleIncoming = useCallback(
    (message: Message) => {
      if (message.senderId === user?.id) return;
      markRead();
    },
    [markRead, user?.id],
  );
  useRoomMessagesRealtime(roomId, { onIncoming: handleIncoming });
  const { typingUserIds, notifyTyping } = useTypingIndicator(roomId);

  return (
    <section className="chat-panel chat-panel-active">
      <ChatRoomHeader room={room} />
      <div className="chat-panel-body">
        <MessageList roomId={roomId} onRetry={retry} />
        <TypingIndicator count={typingUserIds.length} />
      </div>
      <MessageCompose
        onSend={send}
        onSendImage={sendImage}
        onTyping={notifyTyping}
      />
    </section>
  );
};
