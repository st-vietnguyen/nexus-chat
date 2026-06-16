import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@app/shared/contexts/auth.context';
import { useModal } from '@app/shared/contexts/modal.context';
import PersonIcon from '@assets/icons/ic-person.svg?react';
import ChatIcon from '@assets/icons/ic-chat.svg?react';
import GroupIcon from '@assets/icons/ic-group.svg?react';
import LogOutIcon from '@assets/icons/ic-logout.svg?react';
import { FindFriendsModal } from './FindFriendsModal';
import { EditProfileModal } from './EditProfileModal';

type NavKey = 'chat' | 'friends' | 'logout';

const NAV_ICONS: Record<NavKey, React.FC<React.SVGProps<SVGSVGElement>>> = {
  chat: ChatIcon,
  friends: GroupIcon,
  logout: LogOutIcon,
};

export const SideNav = () => {
  const { t } = useTranslation('chat');
  const { user, clearUserSession: handleLogout } = useAuth();
  const { openModal } = useModal();
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const activeKey: NavKey = 'chat';

  const handleFindFriends = useCallback(
    () =>
      openModal({
        title: t('findFriends.title'),
        content: <FindFriendsModal />,
      }),
    [openModal, t],
  );

  const handleEditProfile = useCallback(
    () =>
      openModal({
        title: t('editProfile.title'),
        content: <EditProfileModal />,
      }),
    [openModal, t],
  );

  const navItems: { key: NavKey; onClick?: () => void }[] = [
    { key: 'chat' },
    { key: 'friends', onClick: handleFindFriends },
    { key: 'logout', onClick: handleLogout },
  ];

  return (
    <nav className="side-nav">
      <div className="side-nav-brand">
        <button
          type="button"
          className="side-nav-avatar"
          onClick={handleEditProfile}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="User Avatar" />
          ) : (
            <PersonIcon />
          )}
        </button>
      </div>

      <ul className="side-nav-list">
        {navItems.map((item) => {
          const isActive = item.key === activeKey;
          const Icon = NAV_ICONS[item.key];
          return (
            <li key={item.key}>
              <button
                type="button"
                className={`side-nav-item ${isActive ? 'side-nav-item-active' : ''}`}
                onClick={item.onClick}
              >
                <Icon />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
