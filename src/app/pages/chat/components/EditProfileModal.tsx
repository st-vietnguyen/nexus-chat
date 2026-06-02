import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Typography } from '@app/shared/components/partials';
import { useAuth } from '@app/shared/contexts/auth.context';
import { useModal } from '@app/shared/contexts/modal.context';
import { updateProfile, uploadAvatar } from '@core/services/profile.service';
import PersonIcon from '@assets/icons/ic-person.svg?react';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

export const EditProfileModal = () => {
  const { t } = useTranslation('chat');
  const { user } = useAuth();
  const { closeModal } = useModal();

  const currentAvatar = user?.user_metadata?.avatar_url as string | undefined;
  const currentName = (user?.user_metadata?.display_name as string) ?? '';

  const [displayName, setDisplayName] = useState(currentName);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
        setError(t('editProfile.fileTooLarge'));
        return;
      }

      setError('');
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    },
    [t],
  );

  const handleSave = useCallback(async () => {
    if (!user) return;

    setIsSaving(true);
    setError('');

    try {
      let avatarUrl: string | undefined;

      if (avatarFile) {
        const result = await uploadAvatar(user.id, avatarFile);
        avatarUrl = result.publicUrl;
      }

      await updateProfile({
        id: user.id,
        displayName: displayName.trim() || undefined,
        avatarUrl,
      });

      closeModal();
    } catch {
      setError(t('editProfile.saveError'));
    } finally {
      setIsSaving(false);
    }
  }, [user, avatarFile, displayName, closeModal, t]);

  const shownAvatar = previewUrl ?? currentAvatar;

  return (
    <div className="edit-profile">
      <div className="edit-profile-avatar-section">
        <button
          type="button"
          className="edit-profile-avatar"
          onClick={() => fileRef.current?.click()}
          aria-label={t('editProfile.changeAvatar')}
        >
          {shownAvatar ? <img src={shownAvatar} alt="" /> : <PersonIcon />}
          <span className="edit-profile-avatar-overlay">
            <Typography variant="label-md">
              {t('editProfile.changeAvatar')}
            </Typography>
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="visually-hidden"
          onChange={handleAvatarChange}
        />
      </div>

      <div className="edit-profile-field">
        <label className="edit-profile-label" htmlFor="edit-display-name">
          <Typography variant="label-md" color="text-secondary">
            {t('editProfile.displayName')}
          </Typography>
        </label>
        <input
          id="edit-display-name"
          type="text"
          className="edit-profile-input"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={t('editProfile.displayNamePlaceholder')}
        />
      </div>

      {error && (
        <div className="edit-profile-error" role="alert">
          <Typography variant="body-sm" color="danger-text">
            {error}
          </Typography>
        </div>
      )}

      <div className="edit-profile-actions">
        <Button
          type="button"
          className="btn-secondary"
          onClick={closeModal}
          isDisabled={isSaving}
        >
          {t('editProfile.cancel')}
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          isDisabled={isSaving}
          isLoading={isSaving}
        >
          {t('editProfile.save')}
        </Button>
      </div>
    </div>
  );
};
