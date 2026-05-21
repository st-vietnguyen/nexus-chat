import React from 'react';
import { PageRoute } from '@core/modules/custom-router-dom/router.interface';

const Chat = React.lazy(() => import('./containers/Chat'));

const chatRoutes: PageRoute[] = [
  {
    path: '/',
    element: Chat,
    isProtected: true,
  },
];

export default chatRoutes;
