import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { TFunction } from 'i18next';
import { signUpWithEmail } from '@app/core/services/auth.service';
import { Button, Input, Typography } from '@app/shared/components/partials';

const createSchema = (t: TFunction) =>
  z
    .object({
      email: z.string().email(t('register.email.error')),
      password: z.string().min(6, t('register.password.error')),
      confirmPassword: z.string().min(1, t('register.confirmPassword.error')),
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
  const navigate = useNavigate();

  const schema = useMemo(() => createSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RegisterForm>({
    mode: 'onTouched',
    resolver: zodResolver(schema),
  });

  const onRegister = async (data: RegisterForm) => {
    setStatus(null);
    try {
      const { error, data: result } = await signUpWithEmail(
        data.email,
        data.password,
      );
      if (error) {
        setStatus({ type: 'error', msg: error.message });
        return;
      }
      if (result.session) {
        navigate('/');
      } else {
        setStatus({ type: 'success', msg: t('register.confirmEmail') });
      }
    } catch {
      setStatus({ type: 'error', msg: t('register.networkError') });
    }
  };

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

      <form className="form" onSubmit={handleSubmit(onRegister)}>
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
            className={`auth-alert auth-alert-${status.type}`}
            role={status.type === 'error' ? 'alert' : 'status'}
          >
            {status.msg}
          </div>
        )}

        <div className="form-group">
          <Button
            type="submit"
            className="btn-primary btn-block"
            isLoading={isSubmitting}
            isDisabled={!isValid || isSubmitting}
            title={t('register.btn')}
          />
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
