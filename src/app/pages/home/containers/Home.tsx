import React from 'react';
import { useTranslation } from 'react-i18next';
import ReactLogo from '@assets/react.svg?react';
import viteLogo from '/vite.svg';

const Home = (): JSX.Element => {
  const { t } = useTranslation('common');
  return (
    <div className="home-page">
      <div className="txt-bold">{t('pages.homepage')}({process.env.APP_ENV})</div>
      <div className='logo-container'>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <ReactLogo className='logo'/>
        </a>
      </div>
      <h1>Vite + React</h1>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
};

export default Home;
