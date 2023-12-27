import React from 'react';

import { PageRoute } from '@core/modules/custom-router-dom/router.interface';
import { articleLoader } from './articlesLoader';

const Articles = React.lazy(() => import('./containers/Articles'));
const ArticleDetail = React.lazy(() => import('./containers/ArticleDetail'));
const ArticleList = React.lazy(() => import('./containers/ArticleList'));
const articleRoutes: PageRoute[] = [
  {
    path: 'articles',
    element: Articles,
    isProtected: true,
    children: [
      {
        path: '',
        element: ArticleList,
        loader: articleLoader,
      },
      {
        path: ':id',
        element: ArticleDetail
      }
    ]
  }
];

export default articleRoutes;
