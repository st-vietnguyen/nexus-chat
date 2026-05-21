import React from 'react';
import { useTranslation } from 'react-i18next';

import ShortLogoIcon from '@assets/icons/ic-short-logo.svg?react';

const Home = () => {
  const { t } = useTranslation(['common', 'home']);

  return (
    <div className="home-page">
      <div className="container">
        <div className="page-inner">
          <div className="logo">
            <ShortLogoIcon aria-label="short-logo" />
          </div>
          <h1 className="title">{t('home:title')}</h1>
          <p className="desc">{t('home:description')}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
