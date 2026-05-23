import { useTranslation } from 'react-i18next';
import { Button, Typography } from '@app/shared/components/partials';
import WavingHandIcon from '@assets/icons/ic-waving-hand.svg?react';

interface EmptyRoomListProps {
  onFindFriends: () => void;
}

export const EmptyRoomList = ({ onFindFriends }: EmptyRoomListProps) => {
  const { t } = useTranslation('chat');

  return (
    <div className="room-list-empty">
      <div className="room-list-empty-icon">
        <WavingHandIcon />
      </div>
      <Typography variant="h3" align="center">
        {t('emptyRooms.heading')}
      </Typography>
      <Typography variant="body-md" align="center" color="text-secondary">
        {t('emptyRooms.subtitle')}
      </Typography>
      <Button
        type="button"
        className="btn-primary btn-block"
        title={t('emptyRooms.cta')}
        onClick={onFindFriends}
      />
    </div>
  );
};
