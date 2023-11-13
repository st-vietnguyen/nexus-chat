import React from 'react';
import { useDispatch } from 'react-redux';

import { signIn } from '../auth.actions';

const Login = () => {
  const dispatch = useDispatch();

  const onLogin = () => {
    const account = { username: 'kminchelle', password: '0lelplR' };
    dispatch(
      signIn(account)
    );
  };

  return (
    <div>
      <button onClick={onLogin}>Login</button>
    </div>
  );
};

export default Login;
