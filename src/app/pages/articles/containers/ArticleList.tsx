import React from 'react';
import { NavLink } from 'react-router-dom';

import { useFetchArticles } from '@app/core/hooks/data/useFetchArticles';
import withLoading from '@app/shared/hoc/withLoading';

export type Post = {
  id: number;
  title: string;
  body: string;
};

export type Posts = {
  posts: Post[];
};

type ArticleListTemplateProps = {
  posts: Post[];
};

const ArticleListTemplate = ({ posts }: ArticleListTemplateProps) => {
  return (
    <div>
      <h1 className="txt-bold">This is article-list page</h1>
      <ul className="article-list mt-4 px-10">
        {posts.map((post) => {
          return (
            <li key={post.id} className="article-item txt-left mb-4 pd-4">
              <h3 className="article-title txt-bold">
                <NavLink className="article-link" to={post.id.toString()}>
                  {post.title}
                </NavLink>
              </h3>
              <p className="article-content">{post.body}</p>
            </li>
          );
        })}
      </ul>
    </div>
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
