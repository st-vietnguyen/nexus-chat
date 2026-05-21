import React from 'react';

import { PageRoute } from '@core/modules/custom-router-dom/router.interface';
import chatRoutes from './chat/chat.routes';
import articleRoutes from './articles/article.routes';
import errorRoutes from './error/error.routes';

const Page = React.lazy(() => import('./Page'));

const pageRoutes: PageRoute[] = [
  ...chatRoutes,
  {
    path: '/',
    element: Page,
    children: [...articleRoutes, ...errorRoutes],
  },
];

export default pageRoutes;
