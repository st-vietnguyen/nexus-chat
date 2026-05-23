import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import useSWR from 'swr';
import { Spinner } from '@app/shared/components/common';
import type { RootState } from '@app/store';
import { useAuth } from '@app/shared/contexts/auth.context';
import { getJoinedRooms } from '@app/core/services/room.service';
import { setSelectedRoomId } from '../chat.slice';
import { EmptyRoomList } from './EmptyRoomList';
import { RoomItem } from './RoomItem';

interface RoomListProps {
  onFindFriends: () => void;
}

export const RoomList = ({ onFindFriends }: RoomListProps) => {
  const { t } = useTranslation('chat');
  const dispatch = useDispatch();
  const { user } = useAuth();
  const selectedRoomId = useSelector(
    (state: RootState) => state.chat.selectedRoomId,
  );

  const fetcher = useCallback(() => getJoinedRooms(user!.id), [user?.id]);

  const {
    data: rooms,
    isLoading,
    error,
  } = useSWR(user ? ['rooms', user.id] : null, fetcher);
  const handleSelect = useCallback(
    (id: string) => dispatch(setSelectedRoomId(id)),
    [dispatch],
  );

  if (isLoading) {
    return (
      <div className="room-list-status">
        <Spinner className="spinner-md" />
        <p>{t('list.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="room-list-status room-list-status-error" role="alert">
        {t('list.error')}
      </div>
    );
  }

  if (!rooms?.length) {
    return <EmptyRoomList onFindFriends={onFindFriends} />;
  }

  return (
    <ul className="room-list">
      {rooms.map((room) => (
        <RoomItem
          key={room.id}
          room={room}
          isActive={room.id === selectedRoomId}
          onSelect={handleSelect}
        />
      ))}
    </ul>
  );
};
