import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useMatch, useNavigate } from 'react-router-dom';
import { Typography } from '@app/shared/components/partials';
import { useDirectPeers } from '@app/shared/hooks/data/useDirectPeers';
import { useJoinedRooms } from '@app/shared/hooks/data/useJoinedRooms';
import { useRoomListRealtime } from '@app/shared/hooks/data/useRoomListRealtime';
import { includesKeyword, normalizeKeyword } from '@app/shared/utils/highlight';
import { ROOM_TYPE } from '@app/types';
import { EmptyRoomList } from './EmptyRoomList';
import { RoomItem } from './RoomItem';
import { RoomItemSkeleton } from './RoomItemSkeleton';

interface RoomListProps {
  onFindFriends: () => void;
  searchKeyword: string;
}

export const RoomList = ({ onFindFriends, searchKeyword }: RoomListProps) => {
  const { t } = useTranslation('chat');
  const navigate = useNavigate();
  const activeRoomMatch = useMatch('/chat/rooms/:roomId');
  const activeRoomId = activeRoomMatch?.params.roomId;

  const { data: rooms, isLoading, error } = useJoinedRooms();
  const { data: peers, isLoading: isPeersLoading } = useDirectPeers(rooms);

  useRoomListRealtime({ activeRoomId });

  const handleSelect = useCallback(
    (id: string) => navigate(`/chat/rooms/${id}`),
    [navigate],
  );

  const visibleRooms = useMemo(
    () => rooms?.filter((r) => r.lastMessageAt || r.id === activeRoomId) ?? [],
    [rooms, activeRoomId],
  );

  const normalizedKeyword = useMemo(
    () => normalizeKeyword(searchKeyword),
    [searchKeyword],
  );

  const filteredRooms = useMemo(() => {
    if (!normalizedKeyword) return visibleRooms;
    return visibleRooms.filter((room) => {
      if (includesKeyword(room.name, normalizedKeyword)) return true;
      if (includesKeyword(room.lastMessagePreview, normalizedKeyword)) {
        return true;
      }
      if (room.type === ROOM_TYPE.DIRECT) {
        const peer = peers?.[room.id];
        if (
          includesKeyword(peer?.displayName, normalizedKeyword) ||
          includesKeyword(peer?.email, normalizedKeyword)
        ) {
          return true;
        }
      }
      return false;
    });
  }, [visibleRooms, peers, normalizedKeyword]);

  const firstMatchRef = useRef<HTMLLIElement | null>(null);
  const firstMatchId = filteredRooms[0]?.id;

  useEffect(() => {
    if (!normalizedKeyword) return;
    firstMatchRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [normalizedKeyword, firstMatchId]);

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

  if (!visibleRooms.length) {
    return <EmptyRoomList onFindFriends={onFindFriends} />;
  }

  if (!filteredRooms.length) {
    return (
      <div className="room-list-empty-search" role="status">
        <Typography variant="h3" align="center">
          {t('emptySearch.title')}
        </Typography>
        <Typography variant="body-md" align="center" color="text-secondary">
          {t('emptySearch.subtitle')}
        </Typography>
      </div>
    );
  }

  return (
    <ul className="room-list">
      {filteredRooms.map((room, idx) => (
        <RoomItem
          key={room.id}
          ref={idx === 0 ? firstMatchRef : undefined}
          room={room}
          isActive={room.id === activeRoomId}
          onSelect={handleSelect}
          peer={peers?.[room.id] ?? null}
          isPeerLoading={isPeersLoading}
          searchKeyword={normalizedKeyword}
        />
      ))}
    </ul>
  );
};
