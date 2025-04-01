import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Post } from '@app/pages/articles/containers/ArticleList';
import { FetchingStatus } from '@app/shared/enum/fetchingStatus';
import { ArticleService } from '@app/shared/services/article.service';

export interface ArticleState {
  status: FetchingStatus;
  article: Post | null;
  error: string | null;
}

const initialState: ArticleState = {
  status: FetchingStatus.IDLE,
  article: null,
  error: null,
};

const articleService = new ArticleService();

export const fetchArticleDetail = createAsyncThunk<Post, string>(
  'article/fetchArticleDetail',
  async (id: string): Promise<Post> => {
    const response = await articleService.getArticleDetail(id);
    return response as Post;
  },
);

export const articleSlice = createSlice({
  name: 'article',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchArticleDetail.pending, (state) => {
        state.status = FetchingStatus.LOADING;
      })
      .addCase(
        fetchArticleDetail.fulfilled,
        (state, action: PayloadAction<Post>) => {
          state.status = FetchingStatus.SUCCEEDED;
          state.article = action.payload;
        },
      )
      .addCase(fetchArticleDetail.rejected, (state, action) => {
        state.status = FetchingStatus.FAILED;
        state.error = action.error.message ?? 'Something went wrong';
      });
  },
});

export default articleSlice.reducer;
