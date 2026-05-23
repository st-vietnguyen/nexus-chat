import { useTranslation } from 'react-i18next';
import { Typography } from '@app/shared/components/partials';
import { useModal } from '@app/shared/contexts/modal.context';
import { RoomList } from './RoomList';
import { FindFriendsModal } from './FindFriendsModal';
import SearchIcon from '@assets/icons/ic-search.svg?react';

export const RoomSidebar = () => {
  const { t } = useTranslation('chat');
  const { openModal } = useModal();

  const handleFindFriends = () =>
    openModal({
      title: t('findFriends.title'),
      content: <FindFriendsModal />,
    });

  return (
    <aside className="room-sidebar" aria-label={t('sidebar.title')}>
      <div className="room-sidebar-header">
        <Typography variant="h1">{t('sidebar.title')}</Typography>
        <div className="room-sidebar-search">
          <SearchIcon className="room-sidebar-search-icon" />
          <input
            type="search"
            className="room-sidebar-search-input"
            placeholder={t('sidebar.searchPlaceholder')}
            aria-label={t('sidebar.searchPlaceholder')}
          />
        </div>
      </div>
      <div className="room-sidebar-body">
        <RoomList onFindFriends={handleFindFriends} />
      </div>
    </aside>
  );
};
