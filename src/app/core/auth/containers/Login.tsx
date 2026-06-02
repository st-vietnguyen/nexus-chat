import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { TFunction } from 'i18next';
import { signInWithEmail } from '@app/core/services/auth.service';
import { Button, Input, Typography } from '@app/shared/components/partials';

const createSchema = (t: TFunction) =>
  z.object({
    email: z.string().email(t('logIn.email.error')),
    password: z.string().min(1, t('logIn.password.error')),
  });

type LoginForm = z.infer<ReturnType<typeof createSchema>>;

const Login = () => {
  const { t } = useTranslation('auth');
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();

  const schema = useMemo(() => createSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginForm>({
    mode: 'onTouched',
    resolver: zodResolver(schema),
  });

  const onLogin = async (data: LoginForm) => {
    setApiError(null);
    try {
      const { error } = await signInWithEmail(data.email, data.password);
      if (error) {
        setApiError(error.message);
        return;
      }
      navigate('/chat');
    } catch {
      setApiError(t('logIn.networkError'));
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
        {t('logIn.heading')}
      </Typography>
      <Typography
        variant="body-sm"
        color="text-secondary"
        align="center"
        className="auth-subtitle"
      >
        {t('logIn.subtitle')}
      </Typography>

      <form className="form" onSubmit={handleSubmit(onLogin)}>
        <Input
          type="email"
          name="email"
          label={t('logIn.email.label')}
          register={register('email')}
          errorMsg={errors.email?.message}
          hasApiErr={!!errors.email?.message}
          placeHolder={t('logIn.email.placeholder')}
        />
        <Input
          type="password"
          name="password"
          label={t('logIn.password.label')}
          placeHolder={t('logIn.password.placeholder')}
          register={register('password')}
          errorMsg={errors.password?.message}
          hasApiErr={!!errors.password?.message}
        />

        {apiError && (
          <div className="auth-alert auth-alert-error" role="alert">
            {apiError}
          </div>
        )}

        <div className="form-group">
          <Button
            type="submit"
            className="btn-primary btn-block"
            isLoading={isSubmitting}
            isDisabled={!isValid || isSubmitting}
          >
            {t('logIn.btn')}
          </Button>
        </div>
      </form>

      <div className="auth-links">
        <p>
          {t('logIn.noAccount')}{' '}
          <Link to="/auth/register" className="auth-link">
            {t('logIn.register')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
