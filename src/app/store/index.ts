import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import articleReducer from '@app/pages/articles/article.slice';

export const store = configureStore({
  reducer: {
    article: articleReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
