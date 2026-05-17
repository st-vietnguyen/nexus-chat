import React from 'react';

import { Post } from '../containers/ArticleList';
import withLoading from '@app/shared/hoc/withLoading';

const ArticleDetailContent: React.FC<{ article: Post }> = ({ article }) => {
  return (
    <div className="article">
      <h1 className="article-title txt-bold">{article?.title}</h1>
      <div className="article-body">{article?.body}</div>
    </div>
  );
};

export default withLoading(ArticleDetailContent);
