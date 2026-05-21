import type { Room } from '@app/core/services/room.service';
import { formatTime } from '@core/helpers/date.helper';
import PersonIcon from '@assets/icons/ic-person.svg?react';

interface RoomItemProps {
  room: Room;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export const RoomItem = ({ room, isActive, onSelect }: RoomItemProps) => {
  const label = room.name ?? 'Untitled';

  return (
    <li>
      <button
        type="button"
        className={`room-item ${isActive ? 'room-item-active' : ''}`}
        onClick={() => onSelect(room.id)}
        aria-pressed={isActive}
      >
        <div className="room-item-avatar">
          {room.avatar_url ? (
            <img src={room.avatar_url} alt="" />
          ) : (
            <PersonIcon />
          )}
        </div>
        <div className="room-item-body">
          <p className="room-item-name">{label}</p>
          <p className="room-item-meta">{formatTime(room.last_message_at)}</p>
        </div>
      </button>
    </li>
  );
};
