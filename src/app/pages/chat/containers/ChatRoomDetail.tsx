import { useParams } from 'react-router-dom';
import { useJoinedRooms } from '@app/shared/hooks/data/useJoinedRooms';
import { ChatRoomPanel } from '../components/ChatRoomPanel';
import { EmptyChatPanel } from '../components/EmptyChatPanel';

const ChatRoomDetail = () => {
  const { roomId } = useParams<{ roomId: string }>();
  // Until the rooms cache is populated we can't tell membership, so render the
  // panel optimistically. Once rooms are loaded, redirect to empty state if
  // the URL points at a room the user no longer belongs to (deleted room,
  // stale bookmark). SWR dedupes the request across this hook and the sidebar.
  const { data: rooms } = useJoinedRooms();

  if (!roomId) return <EmptyChatPanel />;
  if (rooms && !rooms.some((r) => r.id === roomId)) return <EmptyChatPanel />;
  return <ChatRoomPanel roomId={roomId} />;
};

export default ChatRoomDetail;
