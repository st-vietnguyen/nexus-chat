import React, { useContext, useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { AuthContext } from '@app/shared/contexts/auth.context';
import { AuthService } from '@app/core/services/auth.service';
import { Button, Input } from '@app/shared/components/partials';
import { User } from '@app/shared/models/user';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const auth = new AuthService();
  const { setUserSession } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation('auth');

  const schema = z.object({
    username: z.string().nonempty(t('logIn.username.error.required')),
    password: z.string().nonempty(t('logIn.password.error.required')),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    resolver: zodResolver(schema),
  });

  const onLogin = useCallback(
    // Demo login info: emilys/emilyspass
    async (data: { username: string; password: string }) => {
      setIsLoading(true);
      try {
        const res = await auth.signIn<User>(data);
        setIsLoading(false);
        setUserSession(res);
        auth.setToken(res.accessToken);
        navigate('/');
      } catch (error) {
        setIsLoading(false);
        console.log(error);
        //TODO: Handle error
      }
    },
    [auth, setUserSession, navigate],
  );

  return (
    <>
      <div className="page-heading">
        <h1 className="page-title">{t('logIn.title')}</h1>
      </div>
      <div className="page-content">
        <form className="form" onSubmit={handleSubmit(onLogin)}>
          <Input
            type="text"
            name="username"
            register={register('username')}
            label={t('logIn.username.label')}
            errorMsg={errors.username?.message}
          />
          <Input
            type="password"
            name="password"
            register={register('password')}
            label={t('logIn.password.label')}
            errorMsg={errors.password?.message}
          />
          <div className="form-group">
            <Button
              type="submit"
              className="btn btn-primary btn-block"
              isLoading={isLoading}
              isDisabled={isLoading || !isValid}
              title={t('logIn.btn')}
            />
          </div>
        </form>
        <div className="tips txt-center">
          <Link to="/" className="txt-link">
            {t('logIn.forgotPassword')}
          </Link>
          <p>
            {t('logIn.noAccount')}
            <Link to="/auth/register" className="txt-link ml-1">
              {t('logIn.register')}
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
