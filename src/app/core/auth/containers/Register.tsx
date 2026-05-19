import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpWithEmail } from '@app/core/services/auth.service';
import { Button, Input, Typography } from '@app/shared/components/partials';

const schema = z
  .object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof schema>;

const Register = () => {
  const [status, setStatus] = useState<{
    type: 'error' | 'success';
    msg: string;
  } | null>(null);
  const navigate = useNavigate();

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
        setStatus({
          type: 'success',
          msg: 'Check your email to confirm your account.',
        });
      }
    } catch {
      setStatus({ type: 'error', msg: 'Network error. Please try again.' });
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
        Create account
      </Typography>
      <Typography
        variant="body-sm"
        color="text-secondary"
        align="center"
        className="auth-subtitle"
      >
        Sign up to start chatting
      </Typography>

      <form className="form" onSubmit={handleSubmit(onRegister)}>
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
          register={register('password')}
          placeHolder="Password"
          errorMsg={errors.password?.message}
          hasApiErr={!!errors.password?.message}
        />
        <Input
          type="password"
          name="confirmPassword"
          label="Confirm password"
          placeHolder="Confirm password"
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
            title="Create account"
          />
        </div>
      </form>

      <div className="auth-links">
        <p>
          Already have an account?{' '}
          <Link to="/auth/login" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
