import { useTranslation } from 'react-i18next';
import { Typography } from '@app/shared/components/partials';
import { useDirectPeer } from '@app/shared/hooks/data/useDirectPeer';
import { useJoinedRooms } from '@app/shared/hooks/data/useJoinedRooms';
import { useRoomPresence } from '@app/shared/hooks/data/useRoomPresence';
import { ROOM_TYPE } from '@app/types';
import CallIcon from '@assets/icons/ic-call.svg?react';
import VideocamIcon from '@assets/icons/ic-videocam.svg?react';
import MoreVertIcon from '@assets/icons/ic-more-vert.svg?react';
import { Avatar } from './Avatar';
import { ChatRoomHeaderSkeleton } from './ChatRoomHeaderSkeleton';

interface ChatRoomHeaderProps {
  roomId: string;
}

export const ChatRoomHeader = ({ roomId }: ChatRoomHeaderProps) => {
  const { t } = useTranslation('chat');

  const { data: rooms, isLoading: isRoomsLoading } = useJoinedRooms();
  const room = rooms?.find((r) => r.id === roomId);
  const isDirect = room?.type === ROOM_TYPE.DIRECT;

  const { onlineUserIds } = useRoomPresence(roomId);

  const { data: peer, isLoading: isPeerLoading } = useDirectPeer(
    roomId,
    !!isDirect,
  );

  const isHeaderPending =
    isRoomsLoading || !room || (isDirect && isPeerLoading);

  if (isHeaderPending) {
    return <ChatRoomHeaderSkeleton />;
  }

  const label = isDirect
    ? (peer?.displayName ?? peer?.email ?? t('room.untitled'))
    : (room?.name ?? t('room.untitled'));

  const avatarUrl = isDirect ? peer?.avatarUrl : room?.avatarUrl;

  // For direct rooms, presence resolves to the peer's tracked state on the
  // shared room-presence channel. For group rooms we don't display per-member
  // status in the header; the dot stays hidden until a roster view exists.
  const isPeerOnline = isDirect && !!peer && onlineUserIds.includes(peer.id);
  const statusLabel = isPeerOnline ? t('header.online') : t('header.offline');

  return (
    <header className="chat-room-header">
      <div className="chat-room-header-avatar">
        <Avatar url={avatarUrl} />
      </div>

      <div className="chat-room-header-body">
        <Typography variant="h2" className="chat-room-header-name">
          {label}
        </Typography>
        {isDirect && (
          <span
            className={`chat-room-header-status${isPeerOnline ? '' : ' chat-room-header-status-offline'}`}
          >
            <span className="chat-room-header-status-dot" aria-hidden="true" />
            {statusLabel}
          </span>
        )}
      </div>

      <div className="chat-room-header-actions">
        <button
          type="button"
          className="chat-room-header-action-btn"
          aria-label={t('header.call')}
        >
          <CallIcon />
        </button>
        <button
          type="button"
          className="chat-room-header-action-btn"
          aria-label={t('header.video')}
        >
          <VideocamIcon />
        </button>
        <button
          type="button"
          className="chat-room-header-action-btn"
          aria-label={t('header.more')}
        >
          <MoreVertIcon />
        </button>
      </div>
    </header>
  );
};
