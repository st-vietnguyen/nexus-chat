import { forwardRef, memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type Profile,
  type RoomListItem,
} from '@app/core/services/room.service';
import { usePresence } from '@app/shared/contexts/presence.context';
import { highlightMatches } from '@app/shared/utils/highlight';
import { ROOM_TYPE } from '@app/types';
import { formatRelativeI18n } from '@core/helpers/date.helper';
import { Avatar } from './Avatar';
import { RoomItemSkeleton } from './RoomItemSkeleton';

interface RoomItemProps {
  room: RoomListItem;
  isActive: boolean;
  onSelect: (id: string) => void;
  peer?: Profile | null;
  isPeerLoading?: boolean;
  searchKeyword?: string;
}

export const RoomItem = memo(
  forwardRef<HTMLLIElement, RoomItemProps>(
    (
      {
        room,
        isActive,
        onSelect,
        peer,
        isPeerLoading = false,
        searchKeyword = '',
      },
      ref,
    ) => {
      const { t } = useTranslation('chat');
      const { isUserOnline } = usePresence();
      const isDirect = room.type === ROOM_TYPE.DIRECT;

      if (isDirect && isPeerLoading) {
        return <RoomItemSkeleton />;
      }

      const label = isDirect
        ? (peer?.displayName ?? peer?.email ?? room.name ?? t('room.untitled'))
        : (room.name ?? t('room.untitled'));
      const avatarUrl = isDirect ? peer?.avatarUrl : room.avatarUrl;
      const isPeerOnline = isDirect && !!peer && isUserOnline(peer.id);
      const time = formatRelativeI18n(room.lastMessageAt, t);
      const preview = room.lastMessagePreview ?? null;
      const unread = Math.max(0, room.unreadCount ?? 0);
      const showBadge = unread > 0 && !isActive;
      const displayCount = unread > 99 ? '99+' : String(unread);

      return (
        <li ref={ref}>
          <button
            type="button"
            className={`room-item ${isActive ? 'room-item-active' : ''}`}
            onClick={() => onSelect(room.id)}
          >
            <div className="room-item-avatar-wrap">
              <div className="room-item-avatar">
                <Avatar url={avatarUrl} />
              </div>
              {isPeerOnline && (
                <span className="room-item-status-dot" aria-hidden="true" />
              )}
            </div>
            <div className="room-item-body">
              <div className="room-item-row">
                <p className="room-item-name">
                  {highlightMatches(label, searchKeyword)}
                </p>
                {time ? <span className="room-item-time">{time}</span> : null}
              </div>
              <div className="room-item-row">
                <p className="room-item-preview">
                  {preview
                    ? highlightMatches(preview, searchKeyword)
                    : t('room.lastMessageFallback')}
                </p>
                {showBadge ? (
                  <span className="room-item-unread">{displayCount}</span>
                ) : null}
              </div>
            </div>
          </button>
        </li>
      );
    },
  ),
);

RoomItem.displayName = 'RoomItem';
