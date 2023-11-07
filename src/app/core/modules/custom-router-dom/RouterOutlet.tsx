import React from 'react';

import { privateRoute } from './PrivateRoute';

export const renderChildren = (routes) => {
  return routes.map(route => {
    const PrivateRoute = privateRoute(route.element);
    return {
      ...route,
      element: route.isProtected ? <PrivateRoute /> : <route.element />,
      children: route.children ? renderChildren(route.children) : []
    };
  });
};
