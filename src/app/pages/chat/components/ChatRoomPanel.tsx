import { ChatRoomHeader } from './ChatRoomHeader';
import { MessageList } from './MessageList';
import { MessageCompose } from './MessageCompose';

interface ChatRoomPanelProps {
  roomId: string;
}

export const ChatRoomPanel = ({ roomId }: ChatRoomPanelProps) => {
  return (
    <section className="chat-panel chat-panel-active" aria-live="polite">
      <ChatRoomHeader roomId={roomId} />
      <div className="chat-panel-body">
        <MessageList roomId={roomId} />
      </div>
      <MessageCompose />
    </section>
  );
};
