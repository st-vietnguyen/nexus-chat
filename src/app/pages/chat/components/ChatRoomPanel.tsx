import { useSendMessage } from '@app/shared/hooks/data/useSendMessage';
import { ChatRoomHeader } from './ChatRoomHeader';
import { MessageList } from './MessageList';
import { MessageCompose } from './MessageCompose';

interface ChatRoomPanelProps {
  roomId: string;
}

export const ChatRoomPanel = ({ roomId }: ChatRoomPanelProps) => {
  const { send, retry } = useSendMessage(roomId);

  const handleSend = (content: string) => {
    void send(content).catch(() => {
      // Failure surfaced via message status in MessageItem.
    });
  };

  const handleRetry = (tempId: string) => {
    void retry(tempId).catch(() => {
      // Failure surfaced via message status in MessageItem.
    });
  };

  return (
    <section className="chat-panel chat-panel-active" aria-live="polite">
      <ChatRoomHeader roomId={roomId} />
      <div className="chat-panel-body">
        <MessageList roomId={roomId} onRetry={handleRetry} />
      </div>
      <MessageCompose onSend={handleSend} />
    </section>
  );
};
