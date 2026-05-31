import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { Typography } from '@app/shared/components/partials';
import { useAuth } from '@app/shared/contexts/auth.context';
import { getDirectRoomPeer } from '@app/core/services/room.service';
import { useJoinedRooms } from '@app/shared/hooks/data/useJoinedRooms';
import { useRoomPresence } from '@app/shared/hooks/data/useRoomPresence';
import { ROOM_TYPE } from '@app/types';
import PersonIcon from '@assets/icons/ic-person.svg?react';
import CallIcon from '@assets/icons/ic-call.svg?react';
import VideocamIcon from '@assets/icons/ic-videocam.svg?react';
import MoreVertIcon from '@assets/icons/ic-more-vert.svg?react';

interface ChatRoomHeaderProps {
  roomId: string;
}

export const ChatRoomHeader = ({ roomId }: ChatRoomHeaderProps) => {
  const { t } = useTranslation('chat');
  const { user } = useAuth();

  const { data: rooms } = useJoinedRooms();
  const room = rooms?.find((r) => r.id === roomId);
  const isDirect = room?.type === ROOM_TYPE.DIRECT;

  const { onlineUserIds } = useRoomPresence(roomId);

  const peerFetcher = useCallback(
    ([, rId, uId]: [string, string, string]) => getDirectRoomPeer(rId, uId),
    [],
  );
  const { data: peer } = useSWR(
    isDirect && user ? ['direct-peer', roomId, user.id] : null,
    peerFetcher,
  );

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
        {avatarUrl ? <img src={avatarUrl} alt="" /> : <PersonIcon />}
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
