import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { useAuth } from '@app/shared/contexts/auth.context';
import {
  getJoinedRooms,
  getDirectRoomPeer,
} from '@app/core/services/room.service';
import { ROOM_TYPE } from '@app/shared/enum/room';
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

  const roomsFetcher = useCallback(() => getJoinedRooms(user!.id), [user?.id]);
  const { data: rooms } = useSWR(
    user ? ['rooms', user.id] : null,
    roomsFetcher,
  );

  const room = rooms?.find((r) => r.id === roomId);
  const isDirect = room?.type === ROOM_TYPE.DIRECT;

  const peerFetcher = useCallback(
    ([, rId, uId]: [string, string, string]) => getDirectRoomPeer(rId, uId),
    [],
  );
  const { data: peer } = useSWR(
    isDirect && user ? ['direct-peer', roomId, user.id] : null,
    peerFetcher,
  );

  const label = isDirect
    ? (peer?.display_name ?? peer?.email ?? t('room.untitled'))
    : (room?.name ?? t('room.untitled'));

  const avatarUrl = isDirect ? peer?.avatar_url : room?.avatar_url;

  return (
    <header className="chat-room-header">
      <div className="chat-room-header-avatar-wrap">
        <div className="chat-room-header-avatar">
          {avatarUrl ? <img src={avatarUrl} alt="" /> : <PersonIcon />}
        </div>
        <span className="chat-room-header-status-dot" aria-hidden="true" />
      </div>

      <div className="chat-room-header-body">
        <p className="chat-room-header-name">{label}</p>
        <span className="chat-room-header-status">{t('header.online')}</span>
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
