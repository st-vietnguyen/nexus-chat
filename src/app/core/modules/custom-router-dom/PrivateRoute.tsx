import React from 'react';
import { Navigate } from 'react-router-dom';
import { ACCESS_TOKEN_KEY } from '@app/core/constants/constant';

const isAuthenticated = (): boolean => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  return !!token;
};

export const PrivateRoute = ({ component: Wraped }) => {
  return isAuthenticated() ? <Wraped /> : <Navigate to="/auth/login" />;
};
