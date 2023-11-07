import React from 'react';

import { PageRoute } from '@core/modules/custom-router-dom/router.interface';
import { ArticleService } from '@app/shared/services/article.service';

const Articles = React.lazy(() => import('./containers/Articles'));
const ArticleDetail = React.lazy(() => import('./containers/ArticleDetail'));
const ArticleList = React.lazy(() => import('./containers/ArticleList'));
const articleService = new ArticleService();
const articleRoutes: PageRoute[] = [
  {
    path: 'articles',
    element: Articles,
    // isProtected: true,
    children: [
      {
        path: '',
        element: ArticleList,
        loader: () => articleService.getArticleList(),
      },
      {
        path: ':id',
        element: ArticleDetail
      }
    ]
  }
];

export default articleRoutes;
