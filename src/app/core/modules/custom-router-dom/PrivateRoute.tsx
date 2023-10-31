import React from 'react';
import { Navigate } from 'react-router-dom';

const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('ACCESS_TOKEN');
  return !!token;
};

export const privateRoute = (Wrapped) => {
  return () => isAuthenticated() ? <Wrapped /> : <Navigate to="/auth/login" />;
};
