import React from 'react';
import { Outlet } from 'react-router-dom';

const Auth = () => {
  return (
    <div className="pages-container auth-page py-4">
      Auth component works!
      <Outlet />
    </div>
  );
};

export default Auth;
