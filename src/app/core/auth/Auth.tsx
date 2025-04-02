import React from 'react';
import { Link, Outlet } from 'react-router-dom';

import logo from '/icons/full-logo.svg';

const Auth = () => {
  return (
    <div className="container basic-container">
      <header className="header basic-header">
        <Link to="/">
          <img src={logo} alt="Logo" className="logo" />
        </Link>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer basic-footer">
        <ul className="menu-list">
          <li className="menu-item menu-item-active">English</li>
          <li className="menu-item">Japanese</li>
        </ul>
      </footer>
    </div>
  );
};

export default Auth;
