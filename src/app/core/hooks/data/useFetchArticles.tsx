import useSWR from 'swr';
import { ArticleService } from '@app/core/services/article.service';

const SWR_KEY = 'GET_ARTICLE_LIST';

export const useFetchArticles = <T,>() => {
  const client = new ArticleService();
  const { data, ...rest } = useSWR(SWR_KEY, () => client.getArticleList<T>());

  return {
    posts: data,
    ...rest,
  };
};
