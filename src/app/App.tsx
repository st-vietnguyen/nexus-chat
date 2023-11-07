import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import { configureStore } from '@reduxjs/toolkit';
import { logger } from 'redux-logger';

import i18n from './core/services/i18n.service';
import { Footer, Header } from '@shared/components/layout/index';
import { RouterOutlet } from '@core/modules/custom-router-dom';
import '@stylesheet/styles.scss';

import appRoutes from './app.routes';
import appMiddleware from './app.middleware';
import appReducer from './app.reducers';
import AppSuspense from './AppSuspense';

const middleware = createSagaMiddleware();
const store = configureStore({
  reducer: appReducer,
  middleware: [middleware, logger]
}
);

middleware.run(appMiddleware);

const root = createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <AppSuspense fallback={<></>}>
          <Header />
        </AppSuspense>
        <AppSuspense fallback={<></>}>
          <RouterOutlet routes={appRoutes} />
        </AppSuspense>
        <AppSuspense fallback={<></>}>
          <Footer />
        </AppSuspense>
      </BrowserRouter>
    </I18nextProvider>
  </Provider>
);
