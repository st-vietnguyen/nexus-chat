import React from 'react';
import { Outlet } from 'react-router-dom';

const Page = () => {
  return (
    <div className="pages-container py-4">
      <Outlet />
    </div>
  );
};

export default Page;
