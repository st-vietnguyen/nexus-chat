import React, { useContext } from 'react';

import { AuthContext, User } from '@app/shared/contexts/auth.context';
import { AuthService } from '@app/core/services/auth.service';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const auth = new AuthService();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

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
    <div>
      <button onClick={onLogin}>Login</button>
    </div>
  );
};

export default Login;
