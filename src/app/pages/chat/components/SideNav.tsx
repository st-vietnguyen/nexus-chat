import { useTranslation } from 'react-i18next';
import { useAuth } from '@app/shared/contexts/auth.context';
import PersonIcon from '@assets/icons/ic-person.svg?react';
import ChatIcon from '@assets/icons/ic-chat.svg?react';
import GroupIcon from '@assets/icons/ic-group.svg?react';
import CallIcon from '@assets/icons/ic-call.svg?react';
import SettingsIcon from '@assets/icons/ic-settings.svg?react';

type NavKey = 'chat' | 'friends' | 'calls' | 'settings';

const NAV_ICONS: Record<NavKey, React.FC<React.SVGProps<SVGSVGElement>>> = {
  chat: ChatIcon,
  friends: GroupIcon,
  calls: CallIcon,
  settings: SettingsIcon,
};

const navItems: { key: NavKey }[] = [
  { key: 'chat' },
  { key: 'friends' },
  { key: 'calls' },
  { key: 'settings' },
];

export const SideNav = () => {
  const { t } = useTranslation('chat');
  const { user } = useAuth();
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const activeKey: NavKey = 'chat';

  return (
    <nav className="side-nav" aria-label="Primary">
      <div className="side-nav-brand">
        <div className="side-nav-avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt="User Avatar" />
          ) : (
            <PersonIcon />
          )}
        </div>
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
                aria-label={t(`nav.${item.key}`)}
                aria-current={isActive ? 'page' : undefined}
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
