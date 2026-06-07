import { PageRoute } from '@app/core/modules/custom-router-dom/router.interface';
import React from 'react';

const ErrorPage = React.lazy(() => import('./containers/Error'));

const errorRoutes: PageRoute[] = [{ path: '*', element: ErrorPage }];

export default errorRoutes;
