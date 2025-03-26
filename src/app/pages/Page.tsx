import { Footer, Header } from '@app/shared/components/layout';
import React from 'react';
import { Outlet } from 'react-router-dom';

const Page = () => {
  return (
    <>
      <Header />
      <main className="pages-container">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Page;
