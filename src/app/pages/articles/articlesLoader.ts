import { ArticleService } from '@app/shared/services/article.service';

export const articleLoader = () => {
  const articleService = new ArticleService();
  return articleService.getArticleList();
};
