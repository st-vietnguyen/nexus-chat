import React from 'react';
import { NavLink, useLoaderData } from 'react-router-dom';

export type Post = {
  id: number,
  title: string,
  body: string,
}

export type Posts = {
  posts: Post[],
}

const ArticleList = () => {
  const posts = useLoaderData() as Posts;
  
  return (
    <div>
      <h1 className='txt-bold'>This is article-list page</h1>
      <ul className='article-list mt-4 px-10'>
        {
          (posts.posts).map((post) => {
            return(
              <li key={post.id} className='article-item txt-left mb-4 pd-4'>
                <h3 className='article-title txt-bold'>
                  <NavLink className='article-link' to={post.id.toString()}>{post.title}</NavLink>
                </h3>
                <p className='article-content'>{post.body}</p>
              </li>
            );
          })
        }
      </ul>
    </div>
  );
};

export default ArticleList;
