import { configureStore } from '@reduxjs/toolkit';

import counterReducer from '@app/store/slices/counterSlice';
import articleReducer from '@app/store/slices/articleSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    article: articleReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
