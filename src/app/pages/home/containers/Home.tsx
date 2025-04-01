import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import logo from '/icons/short-logo.svg';
import { AppDispatch, RootState } from '@app/store';
import { decrement, increment } from '@app/store/slices/counterSlice';

const Home = () => {
  const { t } = useTranslation(['common', 'home']);

  const count = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div className="home-page">
      <div className="container">
        <div className="page-inner">
          <div className="logo">
            <img src={logo} alt="short-logo" />
          </div>
          <h1 className="title">{t('home:title')}</h1>
          <p className="desc">{t('home:description')}</p>

          <h2>Apply Redux Toolkit</h2>
          <div className="counter">
            <button
              className="btn btn-primary"
              aria-label="Decrement value"
              onClick={() => dispatch(decrement())}
            >
              -
            </button>
            <span className="counter-value">{count}</span>
            <button
              className="btn btn-primary"
              aria-label="Increment value"
              onClick={() => dispatch(increment())}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
