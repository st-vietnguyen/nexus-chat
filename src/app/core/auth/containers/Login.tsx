import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { AuthContext, User } from '@app/shared/contexts/auth.context';
import { AuthService } from '@app/core/services/auth.service';
import { Button, Input } from '@app/shared/components/partials';

const Login = () => {
  const auth = new AuthService();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation('auth');
  const onLogin = async () => {
    const account = { username: 'emilys', password: 'emilyspass' };
    try {
      const res = (await auth.signIn(account)) as User;
      login(res);
      auth.setToken(res.accessToken);
      navigate('/');
    } catch (error) {
      auth.removeToken();
      return error;
    }
  };

  return (
    <>
      <div className="page-heading">
        <h1 className="page-title">
          { t('logIn.title') }
        </h1>
      </div>
      <div className="page-content">
        <div className="form-wrapper">
          <form className="form">
            <Input type="text" name="email" label={t('logIn.email.label')} />
            <Input type="password" name="password" label={t('logIn.password.label')} />
            <div className="form-group">
              <Button type="button" className="btn btn-primary btn-block" onClick={onLogin} title={t('logIn.btn')} />
            </div>
          </form>
        </div>
        <div className="tips txt-center">
          <Link to="/" className="txt-link">{ t('logIn.forgotPassword')}</Link>
          <p>
            {t('logIn.noAccount')}
            <Link to="/auth/register" className="txt-link ml-1">{ t('logIn.register') }</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
