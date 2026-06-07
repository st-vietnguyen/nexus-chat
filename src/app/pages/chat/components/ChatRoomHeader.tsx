import { useTranslation } from 'react-i18next';
import { Typography } from '@app/shared/components/partials';
import { useDirectPeer } from '@app/shared/hooks/data/useDirectPeer';
import { usePresence } from '@app/shared/contexts/presence.context';
import { ROOM_TYPE } from '@app/types';
import type { RoomListItem } from '@app/core/services/room.service';
import CallIcon from '@assets/icons/ic-call.svg?react';
import VideocamIcon from '@assets/icons/ic-videocam.svg?react';
import MoreVertIcon from '@assets/icons/ic-more-vert.svg?react';
import { Avatar } from './Avatar';
import { ChatRoomHeaderSkeleton } from './ChatRoomHeaderSkeleton';

interface ChatRoomHeaderProps {
  room: RoomListItem | null | undefined;
}

export const ChatRoomHeader = ({ room }: ChatRoomHeaderProps) => {
  const { t } = useTranslation('chat');
  const isDirect = room?.type === ROOM_TYPE.DIRECT;
  const { isUserOnline } = usePresence();
  const { data: peer, isLoading: isPeerLoading } = useDirectPeer(
    room?.id ?? null,
    !!isDirect,
  );

  if (!room || (isDirect && isPeerLoading)) {
    return <ChatRoomHeaderSkeleton />;
  }

  const label = isDirect
    ? (peer?.displayName ?? peer?.email ?? t('room.untitled'))
    : (room.name ?? t('room.untitled'));

  const avatarUrl = isDirect ? peer?.avatarUrl : room.avatarUrl;
  const isPeerOnline = isDirect && !!peer && isUserOnline(peer.id);
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
