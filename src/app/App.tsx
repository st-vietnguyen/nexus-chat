import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { createRoot } from 'react-dom/client';
import {
  Outlet,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import { configureStore } from '@reduxjs/toolkit';
import { logger } from 'redux-logger';

import i18n from './core/services/i18n.service';
import { Footer, Header } from '@shared/components/layout/index';
import '@stylesheet/styles.scss';

import appRoutes from './app.routes';
import appMiddleware from './app.middleware';
import appReducer from './app.reducers';
import AppSuspense from './AppSuspense';
import { renderChildren } from './core/modules/custom-router-dom';

const middleware = createSagaMiddleware();
const store = configureStore({
  reducer: appReducer,
  middleware: [middleware, logger]
}
);

middleware.run(appMiddleware);

export const Root = () => {
  return (
    <>
      <AppSuspense fallback={<></>}>
        <Header />
      </AppSuspense>
      <AppSuspense fallback={<></>}>
      <Outlet/>
      </AppSuspense>
      <AppSuspense fallback={<></>}>
        <Footer />
      </AppSuspense>
    </>
  );
};

const router = createBrowserRouter([
  { path: '/', Component: Root, children: renderChildren(appRoutes) },
]);

const root = createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <I18nextProvider i18n={i18n}>
      <RouterProvider router={router}/>
    </I18nextProvider>
  </Provider>
);
