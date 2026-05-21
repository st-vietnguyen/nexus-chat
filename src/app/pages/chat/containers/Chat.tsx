import { useSelector } from 'react-redux';
import type { RootState } from '@app/store';
import { SideNav } from '../components/SideNav';
import { RoomSidebar } from '../components/RoomSidebar';
import { EmptyChatPanel } from '../components/EmptyChatPanel';

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
          <section className="chat-panel" aria-live="polite" />
        ) : (
          <EmptyChatPanel />
        )}
      </main>
    </div>
  );
};

export default Chat;
