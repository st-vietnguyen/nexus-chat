import { useSelector } from 'react-redux';
import type { RootState } from '@app/store';
import { SideNav } from '../components/SideNav';
import { RoomSidebar } from '../components/RoomSidebar';
import { EmptyChatPanel } from '../components/EmptyChatPanel';
import { ChatRoomPanel } from '../components/ChatRoomPanel';

const Chat = () => {
  const selectedRoomId = useSelector(
    (state: RootState) => state.chat.selectedRoomId,
  );

  return (
    <div className="chat-page">
      <SideNav />
      <main className="chat-main">
        <RoomSidebar />
        {selectedRoomId ? (
          <ChatRoomPanel roomId={selectedRoomId} />
        ) : (
          <EmptyChatPanel />
        )}
      </main>
    </div>
  );
};

export default Chat;
