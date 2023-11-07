import { ApiService } from '@core/services/api.service';
import { ENDPOINT } from '@config/endpoint';

export class ArticleService {
  api = new ApiService();

  getArticleList() {
    return this.api.get([ENDPOINT.article.articleList]);
  }
}
