import React from 'react';
import { SWRConfig } from 'swr';
import { I18nextProvider } from 'react-i18next';
import { createRoot } from 'react-dom/client';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { Provider } from 'react-redux';

import i18n from './core/services/i18n.service';
import '@stylesheet/styles.scss';

import appRoutes from './app.routes';
import AppSuspense from './AppSuspense';

import { AuthProvider } from './shared/contexts/auth.context';
import { ModalProvider } from './shared/contexts/modal.context';
import { PresenceProvider } from './shared/contexts/presence.context';
import { renderChildren } from './core/modules/custom-router-dom/RouterOutlet';
import AppErrorBoundaryFallback from './AppErrorBoundaryFallback';
import { swrConfig } from '@config/swr';
import { store } from './store';

export const Root = () => {
  return (
    <>
      <ErrorBoundary FallbackComponent={AppErrorBoundaryFallback}>
        <AppSuspense fallback={<></>}>
          <SWRConfig value={swrConfig}>
            <PresenceProvider>
              <ModalProvider>
                <Outlet />
              </ModalProvider>
            </PresenceProvider>
          </SWRConfig>
        </AppSuspense>
      </ErrorBoundary>
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
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </I18nextProvider>
  </Provider>,
);
