import { useParams } from 'react-router-dom';
import { useJoinedRooms } from '@app/shared/hooks/data/useJoinedRooms';
import { ChatRoomPanel } from '../components/ChatRoomPanel';
import { EmptyChatPanel } from '../components/EmptyChatPanel';

const ChatRoomDetail = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { data: rooms } = useJoinedRooms();

  if (!roomId) return <EmptyChatPanel />;
  if (rooms && !rooms.some((r) => r.id === roomId)) return <EmptyChatPanel />;
  return <ChatRoomPanel roomId={roomId} />;
};

export default ChatRoomDetail;
