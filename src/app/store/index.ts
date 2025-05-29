import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import articleReducer from '@app/store/slices/article-slice';

export const store = configureStore({
  reducer: {
    article: articleReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
