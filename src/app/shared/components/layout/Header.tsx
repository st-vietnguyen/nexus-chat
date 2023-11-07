import React from 'react';
import { Link } from 'react-router-dom';
import i18next from 'i18next';

import { LANGUAGES } from '@app/core/services/i18n.service';

export const Header = (): JSX.Element => {

  const changeLang = (lang: string) => {
    i18next.changeLanguage(lang);
  };

  return (
    <header className="header">
      <nav className="menu-nav">
        <ul className="menu menu-nav d-flex">
          <li className="menu-item">
            <Link to="">Home</Link>
          </li>
          <li className="menu-item">
            <Link to="articles">Articles</Link>
          </li>
          <li className="menu-item">
            <Link to="auth/login">Login</Link>
          </li>
          <li className="menu-item">
            <Link to="auth/register">Register</Link>
          </li>
        </ul>
      </nav>
      <ul className="menu menu-lang d-flex">
        {LANGUAGES.map((lang: string) => {
          return (
            <li className="menu-item" key={lang}>
              <button className="menu-action txt-bold" onClick={() => changeLang(lang)}>
                {lang.toUpperCase()}
              </button>
            </li>
          );
        })}
      </ul>
    </header>
  );
};
