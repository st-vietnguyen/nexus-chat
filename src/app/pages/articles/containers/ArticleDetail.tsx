import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { AppDispatch, RootState } from '@app/store';
import { fetchArticleDetail } from '@app/pages/articles/article.slice';
import { FetchingStatus } from '@app/types';
import ArticleDetailContent from '../components/ArticleDetailContent';

const ArticleDetail = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { article, status } = useSelector((state: RootState) => state.article);
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      dispatch(fetchArticleDetail(id));
    }
  }, [id]);

  return (
    <ArticleDetailContent
      isLoading={status === FetchingStatus.LOADING}
      article={article}
    />
  );
};

export default ArticleDetail;
