import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@app/shared/contexts/auth.context';

export const PrivateRoute = ({ component: Wrapped }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return isAuthenticated ? <Wrapped /> : <Navigate to="/auth/login" />;
};
