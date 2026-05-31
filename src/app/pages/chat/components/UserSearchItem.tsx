import PersonIcon from '@assets/icons/ic-person.svg?react';
import { Typography } from '@app/shared/components/partials';
import type { Profile } from '@app/core/services/profile.service';

interface UserSearchItemProps {
  profile: Profile;
  isDisabled: boolean;
  onSelect: (id: string) => void;
}

export const UserSearchItem = ({
  profile,
  isDisabled,
  onSelect,
}: UserSearchItemProps) => {
  const label = profile.displayName ?? profile.email ?? 'Unknown user';

  return (
    <li>
      <button
        type="button"
        className="modal-user-item"
        disabled={isDisabled}
        onClick={() => onSelect(profile.id)}
      >
        <div className="modal-user-item-avatar">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" />
          ) : (
            <PersonIcon />
          )}
        </div>
        <div className="modal-user-item-body">
          <Typography variant="body-md" className="modal-user-item-name">
            {label}
          </Typography>
          {profile.displayName && profile.email && (
            <Typography variant="body-sm" className="modal-user-item-email">
              {profile.email}
            </Typography>
          )}
        </div>
      </button>
    </li>
  );
};
