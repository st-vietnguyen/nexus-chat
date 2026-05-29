import { Outlet } from 'react-router-dom';
import { SideNav } from '../components/SideNav';
import { RoomSidebar } from '../components/RoomSidebar';

const Chat = () => {
  return (
    <div className="chat-page">
      <SideNav />
      <main className="chat-main">
        <RoomSidebar />
        <Outlet />
      </main>
    </div>
  );
};

export default Chat;
