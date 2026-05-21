import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Spinner } from '@app/shared/components/common';
import type { RootState } from '@app/store';
import { setSelectedRoomId } from '../chat.slice';
import { useRooms } from '../hooks/useRooms';
import { EmptyRoomList } from './EmptyRoomList';
import { RoomItem } from './RoomItem';

export const RoomList = () => {
  const { t } = useTranslation('chat');
  const dispatch = useDispatch();
  const selectedRoomId = useSelector(
    (state: RootState) => state.chat.selectedRoomId,
  );

  const { data: rooms, isLoading, error } = useRooms();

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
    return <EmptyRoomList />;
  }

  return (
    <ul className="room-list">
      {rooms.map((room) => (
        <RoomItem
          key={room.id}
          room={room}
          isActive={room.id === selectedRoomId}
          onSelect={(id) => dispatch(setSelectedRoomId(id))}
        />
      ))}
    </ul>
  );
};
