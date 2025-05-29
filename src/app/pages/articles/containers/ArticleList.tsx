import React from 'react';

import { ArticleCard } from '../components/ArticleCard';

import { useFetchArticles } from '@app/shared/hooks/data/useFetchArticles';
import withLoading from '@app/shared/hoc/withLoading';

export type Post = {
  id: number;
  title: string;
  body: string;
};

export type Posts = {
  posts: Post[];
};

const ArticleListTemplate = ({ posts }: Posts) => {
  return (
    <>
      <div className="page-heading">
        <h1 className="page-title">Explore all articles</h1>
      </div>
      <div className="page-content">
        <ul className="article-list row">
          {posts.map((post) => (
            <li key={post.id} className="col-12 col-md-6 col-lg-4">
              <ArticleCard post={post} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

const ArticleListWithLoading = withLoading(ArticleListTemplate);

const ArticleList = () => {
  const { posts, error, isLoading } = useFetchArticles<Posts>();

  if (error) {
    return (
      <div className="error-message txt-center p-4">
        <h2 className="txt-bold">Error loading articles</h2>
        <p>{error?.message}</p>
      </div>
    );
  }

  return (
    <ArticleListWithLoading isLoading={isLoading} posts={posts?.posts || []} />
  );
};

export default ArticleList;
