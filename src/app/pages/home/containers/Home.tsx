import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import reactLogo from '@assets/react.svg';
import viteLogo from '/vite.svg';
import { AuthContext } from '@app/shared/contexts/authContext';

const Home = (): JSX.Element => {
  const { t } = useTranslation('common');
  const { data } = useContext(AuthContext);

  return (
    <div className="home-page">
      <div className="txt-bold">
        {data?.firstName ? `${t('pages.hello')}, ${data?.firstName}.` : (`${t('pages.homepage')} (${process.env.APP_ENV})`)}
      </div>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
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
