import { useTranslation } from 'react-i18next';
import { type RoomListItem } from '@app/core/services/room.service';
import { useDirectPeer } from '@app/shared/hooks/data/useDirectPeer';
import { ROOM_TYPE } from '@app/types';
import { formatRelativeI18n } from '@core/helpers/date.helper';
import { Avatar } from './Avatar';
import { RoomItemSkeleton } from './RoomItemSkeleton';

interface RoomItemProps {
  room: RoomListItem;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export const RoomItem = ({ room, isActive, onSelect }: RoomItemProps) => {
  const { t } = useTranslation('chat');
  const isDirect = room.type === ROOM_TYPE.DIRECT;

  const { data: peer, isLoading: isPeerLoading } = useDirectPeer(
    room.id,
    isDirect,
  );

  if (isDirect && isPeerLoading) {
    return <RoomItemSkeleton />;
  }

  const label = isDirect
    ? (peer?.displayName ?? peer?.email ?? room.name ?? t('room.untitled'))
    : (room.name ?? t('room.untitled'));
  const avatarUrl = isDirect ? peer?.avatarUrl : room.avatarUrl;
  const time = formatRelativeI18n(room.lastMessageAt, t);
  const preview = room.lastMessagePreview ?? null;
  const unread = Math.max(0, room.unreadCount ?? 0);
  const showBadge = unread > 0 && !isActive;
  const displayCount = unread > 99 ? '99+' : String(unread);

  return (
    <li>
      <button
        type="button"
        className={`room-item ${isActive ? 'room-item-active' : ''}`}
        onClick={() => onSelect(room.id)}
        aria-pressed={isActive}
      >
        <div className="room-item-avatar-wrap">
          <div className="room-item-avatar">
            <Avatar url={avatarUrl} />
          </div>
          <span className="room-item-status-dot" aria-hidden="true" />
        </div>
        <div className="room-item-body">
          <div className="room-item-row">
            <p className="room-item-name">{label}</p>
            {time ? <span className="room-item-time">{time}</span> : null}
          </div>
          <div className="room-item-row">
            <p className="room-item-preview">
              {preview ?? t('room.lastMessageFallback')}
            </p>
            {showBadge ? (
              <span
                className="room-item-unread"
                aria-label={t('room.unreadCount', { count: unread })}
              >
                {displayCount}
              </span>
            ) : null}
          </div>
        </div>
      </button>
    </li>
  );
};
