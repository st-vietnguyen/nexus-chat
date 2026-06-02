import React from 'react';
import { Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';

export const renderChildren = (routes) => {
  return routes.map((route) => {
    if (route.redirect) {
      return {
        path: route.path,
        element: <Navigate to={route.redirect} replace />,
      };
    }
    return {
      ...route,
      element: route.isProtected ? (
        <PrivateRoute component={route.element} />
      ) : (
        <route.element />
      ),
      children: route.children ? renderChildren(route.children) : [],
    };
  });
};
