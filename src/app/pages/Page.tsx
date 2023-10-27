import React from 'react';
import { Outlet } from 'react-router-dom';

const Page = () => {
  return (
    <div className="pages-container">
      Page component works!
      <Outlet />
    </div>
  );
};

export default Page;
