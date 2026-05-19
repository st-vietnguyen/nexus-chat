import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInWithEmail } from '@app/core/services/auth.service';
import { Button, Input, Typography } from '@app/shared/components/partials';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof schema>;

const Login = () => {
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();

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
      navigate('/');
    } catch {
      setApiError('Network error. Please try again.');
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
        Welcome back
      </Typography>
      <Typography
        variant="body-sm"
        color="text-secondary"
        align="center"
        className="auth-subtitle"
      >
        Sign in to continue chatting
      </Typography>

      <form className="form" onSubmit={handleSubmit(onLogin)}>
        <Input
          type="email"
          name="email"
          label="Email"
          register={register('email')}
          errorMsg={errors.email?.message}
          hasApiErr={!!errors.email?.message}
          placeHolder="Example@email.com"
        />
        <Input
          type="password"
          name="password"
          label="Password"
          placeHolder="Password"
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
            title="Sign in"
          />
        </div>
      </form>

      <div className="auth-links">
        <p>
          Don't have an account?{' '}
          <Link to="/auth/register" className="auth-link">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
