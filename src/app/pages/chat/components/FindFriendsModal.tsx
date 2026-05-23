import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@app/shared/components/common';
import { Typography } from '@app/shared/components/partials';
import { useModal } from '@app/shared/contexts/modal.context';
import { useProfiles } from '@app/shared/hooks/data/useProfiles';
import { useStartDirectChat } from '@app/shared/hooks/data/useStartDirectChat';
import { UserSearchItem } from './UserSearchItem';

const SUGGESTION_LIMIT = 10;

export const FindFriendsModal = () => {
  const { t } = useTranslation('chat');
  const { closeModal } = useModal();
  const { profiles, isLoading, error } = useProfiles();
  const { startDirectChat, isStarting } = useStartDirectChat();
  const [query, setQuery] = useState('');
  const [startError, setStartError] = useState(false);

  const isSearching = query.trim().length > 0;

  const displayedProfiles = useMemo(() => {
    if (!isSearching) return profiles.slice(0, SUGGESTION_LIMIT);
    const term = query.trim().toLowerCase();
    return profiles.filter((p) => p.display_name?.toLowerCase().includes(term));
  }, [profiles, query]);

  const handleSelect = useCallback(
    async (id: string) => {
      setStartError(false);
      try {
        await startDirectChat(id);
        closeModal();
      } catch {
        setStartError(true);
      }
    },
    [startDirectChat, closeModal],
  );

  return (
    <>
      <div className="modal-search">
        <input
          type="search"
          className="modal-search-input"
          placeholder={t('findFriends.searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {isLoading && (
        <div className="modal-status">
          <Spinner className="spinner-md" />
          <Typography variant="body-sm">{t('findFriends.loading')}</Typography>
        </div>
      )}

      {error && !isLoading && (
        <div className="modal-status modal-status-error" role="alert">
          {t('findFriends.error')}
        </div>
      )}

      {startError && !isLoading && (
        <div className="modal-status modal-status-error" role="alert">
          {t('findFriends.startError')}
        </div>
      )}

      {!isLoading &&
        !error &&
        !startError &&
        displayedProfiles.length === 0 && (
          <div className="modal-status">{t('findFriends.empty')}</div>
        )}

      {!isLoading && !error && displayedProfiles.length > 0 && (
        <>
          {!isSearching && (
            <div className="modal-section-label">
              <Typography variant="label-md" color="text-secondary">
                {t('findFriends.suggested')}
              </Typography>
            </div>
          )}
          <ul className="modal-user-list">
            {displayedProfiles.map((profile) => (
              <UserSearchItem
                key={profile.id}
                profile={profile}
                isDisabled={isStarting}
                onSelect={handleSelect}
              />
            ))}
          </ul>
        </>
      )}
    </>
  );
};
