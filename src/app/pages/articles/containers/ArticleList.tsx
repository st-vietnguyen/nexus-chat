import React from 'react';
import { useLoaderData } from 'react-router-dom';
import { ArticleCard } from '../components/ArticleCard';

export type Post = {
  id: number;
  title: string;
  body: string;
};

export type Posts = {
  posts: Post[];
};

const ArticleList = () => {
  const posts = useLoaderData<Posts>();

  return (
    <>
      <div className="page-heading">
        <h1 className="page-title">Explore all articles</h1>
      </div>
      <div className="page-content">
        <ul className="article-list row">
          {posts.posts.map((post) => (
            <li key={post.id} className="col-12 col-md-6 col-lg-4">
              <ArticleCard post={post} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default ArticleList;
