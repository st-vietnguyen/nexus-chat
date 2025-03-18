import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import i18next from 'i18next';

import reactLogo from '/react.svg';
import { LANGUAGES } from '@app/core/services/i18n.service';
import { AuthContext } from '@app/shared/contexts/auth.context';
import { AuthService } from '@app/core/services/auth.service';

export const Header = (): JSX.Element => {
  const auth = new AuthService();
  const { data, isAuthenticated, logout } = useContext(AuthContext);

  const changeLang = (lang: string) => {
    i18next.changeLanguage(lang);
  };

  const onLogout = async () => {
    logout();
    auth.removeToken();
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
          {isAuthenticated ? (
            <li className="menu-item">
              <Link to="" onClick={onLogout}>
                Logout
              </Link>
            </li>
          ) : (
            <>
              <li className="menu-item">
                <Link to="auth/login">Login</Link>
              </li>
              <li className="menu-item">
                <Link to="auth/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
      <ul className="menu menu-lang">
        {LANGUAGES.map((lang: string) => {
          return (
            <li className="menu-item" key={lang}>
              <button
                className="menu-action txt-bold"
                onClick={() => changeLang(lang)}
              >
                {lang.toUpperCase()}
              </button>
            </li>
          );
        })}
        <li className="menu-item">
          <img
            src={data?.image ? data.image : reactLogo}
            className="avatar"
            alt="Avatar"
          />
        </li>
      </ul>
    </header>
  );
};
