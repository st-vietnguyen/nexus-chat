import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useMatch, useNavigate } from 'react-router-dom';
import { useJoinedRooms } from '@app/shared/hooks/data/useJoinedRooms';
import { useRoomListRealtime } from '@app/shared/hooks/data/useRoomListRealtime';
import { EmptyRoomList } from './EmptyRoomList';
import { RoomItem } from './RoomItem';
import { RoomItemSkeleton } from './RoomItemSkeleton';

interface RoomListProps {
  onFindFriends: () => void;
}

export const RoomList = ({ onFindFriends }: RoomListProps) => {
  const { t } = useTranslation('chat');
  const navigate = useNavigate();
  const activeRoomMatch = useMatch('/chat/rooms/:roomId');
  const activeRoomId = activeRoomMatch?.params.roomId;

  const { data: rooms, isLoading, error } = useJoinedRooms();

  useRoomListRealtime({ activeRoomId });
  const handleSelect = useCallback(
    (id: string) => navigate(`/chat/rooms/${id}`),
    [navigate],
  );

  if (isLoading) {
    return (
      <ul className="room-list">
        {Array.from({ length: 5 }).map((_, idx) => (
          <RoomItemSkeleton key={idx} />
        ))}
      </ul>
    );
  }

  if (error) {
    return (
      <div className="room-list-status room-list-status-error">
        {t('list.error')}
      </div>
    );
  }

  const visibleRooms =
    rooms?.filter((r) => r.lastMessageAt || r.id === activeRoomId) ?? [];

  if (!visibleRooms.length) {
    return <EmptyRoomList onFindFriends={onFindFriends} />;
  }

  return (
    <ul className="room-list">
      {visibleRooms.map((room) => (
        <RoomItem
          key={room.id}
          room={room}
          isActive={room.id === activeRoomId}
          onSelect={handleSelect}
        />
      ))}
    </ul>
  );
};
