import React, { useContext } from 'react';

import { AuthContext, User } from '@app/shared/contexts/authContext';
import { AuthService } from '@app/core/services/auth.service';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const auth = new AuthService();
  const { login } =useContext(AuthContext);
  const navigate = useNavigate();

  const onLogin = async() => {
    const account = { username: 'kminchelle', password: '0lelplR' };
    try {
      const res = await auth.signIn(account) as User;
      login(res);
      auth.setToken(res.token);
      navigate('/');
    } catch (error) {
      auth.removeToken();
    }
  };

  return (
    <div>
      <button onClick={onLogin}>Login</button>
    </div>
  );
};

export default Login;
