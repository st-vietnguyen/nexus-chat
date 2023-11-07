import React from 'react';
import { useLoaderData } from 'react-router-dom';

const ArticleList = () => {
  const posts = useLoaderData();
  console.log('post', posts);
  return (
    <div>
      This is article-list page
      <p>
        {/* <NavLink to="1">See detail</NavLink> */}
      </p>
    </div>
  );
};

export default ArticleList;
