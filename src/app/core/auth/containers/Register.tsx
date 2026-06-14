import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { TFunction } from 'i18next';
import {
  signUpWithEmail,
  updateAuthUserMetadata,
} from '@app/core/services/auth.service';
import {
  updateProfile,
  uploadAvatar,
} from '@app/core/services/profile.service';
import { Button, Input, Typography } from '@app/shared/components/partials';
import { initialsOf } from '@core/helpers/string.helper';
import { MAX_AVATAR_BYTES, isAcceptedAvatar } from '@core/helpers/file.helper';

const DISPLAY_NAME_MAX = 50;

const createSchema = (t: TFunction) =>
  z
    .object({
      email: z.string().email(t('register.email.error')),
      password: z.string().min(6, t('register.password.error')),
      confirmPassword: z.string().min(1, t('register.confirmPassword.error')),
      displayName: z
        .string()
        .transform((value) => value.trim())
        .pipe(
          z
            .string()
            .min(1, t('register.displayName.required'))
            .max(DISPLAY_NAME_MAX, t('register.displayName.maxLength')),
        ),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('register.confirmPassword.mismatch'),
      path: ['confirmPassword'],
    });

type RegisterForm = z.infer<ReturnType<typeof createSchema>>;

const Register = () => {
  const { t } = useTranslation('auth');
  const [status, setStatus] = useState<{
    type: 'error' | 'success';
    msg: string;
  } | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const schema = useMemo(() => createSchema(t), [t]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RegisterForm>({
    mode: 'onTouched',
    resolver: zodResolver(schema),
  });

  const displayNameValue = watch('displayName') ?? '';

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!file) return;

    if (!isAcceptedAvatar(file)) {
      setAvatarError(t('register.avatar.invalidType'));
      setAvatarFile(null);
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError(t('register.avatar.tooLarge'));
      setAvatarFile(null);
      return;
    }
    setAvatarError(null);
    setAvatarFile(file);
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarError(null);
  };

  const onRegister = async (data: RegisterForm) => {
    setStatus(null);
    const displayName = data.displayName.trim();

    try {
      const { error, data: result } = await signUpWithEmail(
        data.email,
        data.password,
        { displayName },
      );
      if (error) {
        setStatus({ type: 'error', msg: error.message });
        return;
      }

      const user = result.user;
      if (!user) {
        setStatus({ type: 'success', msg: t('register.confirmEmail') });
        return;
      }

      // Trigger handle_new_user already inserted profiles row with
      // display_name from auth metadata. Only persist avatar + metadata
      // when there is an avatar to write.
      let avatarUrl: string | null = null;
      let avatarUploadFailed = false;
      if (avatarFile) {
        try {
          const uploaded = await uploadAvatar(user.id, avatarFile);
          avatarUrl = uploaded.publicUrl;
        } catch {
          avatarUploadFailed = true;
        }

        if (avatarUrl) {
          try {
            const [profileResult] = await Promise.allSettled([
              updateProfile({ id: user.id, avatarUrl }),
              updateAuthUserMetadata({
                // eslint-disable-next-line camelcase -- Supabase auth metadata keys
                avatar_url: avatarUrl,
              }),
            ]);
            if (profileResult.status === 'rejected') {
              setStatus({
                type: 'error',
                msg: t('register.profileCreationFailed'),
              });
              return;
            }
          } catch {
            setStatus({
              type: 'error',
              msg: t('register.profileCreationFailed'),
            });
            return;
          }
        }
      }

      if (avatarUploadFailed) {
        setStatus({ type: 'error', msg: t('register.avatarUploadFailed') });
        return;
      }

      if (result.session) {
        navigate('/chat');
      } else {
        setStatus({ type: 'success', msg: t('register.confirmEmail') });
      }
    } catch {
      setStatus({ type: 'error', msg: t('register.networkError') });
    }
  };

  const submitting = isSubmitting;
  const initials = initialsOf(displayNameValue);

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <Typography variant="h2" color="gradient" align="center">
          Nexus
        </Typography>
      </div>
      <Typography variant="h3" align="center">
        {t('register.heading')}
      </Typography>
      <Typography
        variant="body-sm"
        color="text-secondary"
        align="center"
        className="auth-subtitle"
      >
        {t('register.subtitle')}
      </Typography>

      <form
        className="form"
        onSubmit={handleSubmit(onRegister)}
        noValidate
        aria-busy={submitting}
      >
        <div className="avatar-uploader">
          <button
            type="button"
            className="avatar-uploader-preview"
            onClick={() => fileInputRef.current?.click()}
            aria-label={
              avatarFile
                ? t('register.avatar.replace')
                : t('register.avatar.choose')
            }
            disabled={submitting}
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt={t('register.avatar.previewAlt')} />
            ) : (
              <span className="avatar-uploader-initials" aria-hidden="true">
                {initials || '+'}
              </span>
            )}
          </button>
          <div className="avatar-uploader-actions">
            <span className="avatar-uploader-label">
              {t('register.avatar.label')}
            </span>
            <div className="avatar-uploader-buttons">
              <button
                type="button"
                className="auth-link avatar-uploader-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={submitting}
              >
                {avatarFile
                  ? t('register.avatar.replace')
                  : t('register.avatar.choose')}
              </button>
              {avatarFile && (
                <button
                  type="button"
                  className="auth-link avatar-uploader-btn"
                  onClick={removeAvatar}
                  disabled={submitting}
                >
                  {t('register.avatar.remove')}
                </button>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="visually-hidden"
            onChange={handleAvatarChange}
            data-testid="avatar-input"
          />
          {avatarError && (
            <span className="alert alert-error alert-inline" role="alert">
              {avatarError}
            </span>
          )}
        </div>

        <Input
          type="text"
          name="displayName"
          label={t('register.displayName.label')}
          register={register('displayName')}
          maxLength={DISPLAY_NAME_MAX}
          errorMsg={errors.displayName?.message}
          hasApiErr={!!errors.displayName?.message}
          placeHolder={t('register.displayName.placeholder')}
        />
        <Input
          type="email"
          name="email"
          label={t('register.email.label')}
          register={register('email')}
          errorMsg={errors.email?.message}
          hasApiErr={!!errors.email?.message}
          placeHolder={t('register.email.placeholder')}
        />
        <Input
          type="password"
          name="password"
          label={t('register.password.label')}
          register={register('password')}
          placeHolder={t('register.password.placeholder')}
          errorMsg={errors.password?.message}
          hasApiErr={!!errors.password?.message}
        />
        <Input
          type="password"
          name="confirmPassword"
          label={t('register.confirmPassword.label')}
          placeHolder={t('register.confirmPassword.placeholder')}
          register={register('confirmPassword')}
          errorMsg={errors.confirmPassword?.message}
          hasApiErr={!!errors.confirmPassword?.message}
        />

        {status && (
          <div
            className={`alert alert-${status.type}`}
            role={status.type === 'error' ? 'alert' : 'status'}
          >
            {status.msg}
          </div>
        )}

        <div className="form-group">
          <Button
            type="submit"
            variant="primary"
            className="btn-block"
            isLoading={submitting}
            isDisabled={!isValid || submitting}
          >
            {submitting ? t('register.submitting') : t('register.btn')}
          </Button>
        </div>
      </form>

      <div className="auth-links">
        <p>
          {t('register.hasAccount')}{' '}
          <Link to="/auth/login" className="auth-link">
            {t('register.signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
