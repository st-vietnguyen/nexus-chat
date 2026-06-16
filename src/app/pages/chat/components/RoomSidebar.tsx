import { useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Typography } from '@app/shared/components/partials';
import { useModal } from '@app/shared/contexts/modal.context';
import { RoomList } from './RoomList';
import { FindFriendsModal } from './FindFriendsModal';
import CloseIcon from '@assets/icons/ic-close.svg?react';
import SearchIcon from '@assets/icons/ic-search.svg?react';

export const RoomSidebar = () => {
  const { t } = useTranslation('chat');
  const { openModal } = useModal();
  const [searchKeyword, setSearchKeyword] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFindFriends = () =>
    openModal({
      title: t('findFriends.title'),
      content: <FindFriendsModal />,
    });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setSearchKeyword(e.target.value);

  const handleClear = () => {
    setSearchKeyword('');
    inputRef.current?.focus();
  };

  const hasKeyword = searchKeyword.length > 0;

  return (
    <aside className="room-sidebar">
      <div className="room-sidebar-header">
        <Typography variant="h1">{t('sidebar.title')}</Typography>
        <div className="room-sidebar-search">
          <SearchIcon className="room-sidebar-search-icon" />
          <input
            ref={inputRef}
            type="search"
            className="room-sidebar-search-input"
            placeholder={t('sidebar.searchPlaceholder')}
            value={searchKeyword}
            onChange={handleChange}
          />
          {hasKeyword && (
            <Button
              type="button"
              variant="ghost"
              className="room-sidebar-search-clear"
              onClick={handleClear}
            >
              <CloseIcon />
            </Button>
          )}
        </div>
      </div>
      <div className="room-sidebar-body">
        <RoomList
          onFindFriends={handleFindFriends}
          searchKeyword={searchKeyword}
        />
      </div>
    </aside>
  );
};
