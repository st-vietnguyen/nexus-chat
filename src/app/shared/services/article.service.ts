import { ApiService } from '@core/services/api.service';
import { ENDPOINT } from '@config/endpoint';

export class ArticleService {
  api = new ApiService();

  async getArticleList() {
    return this.api.get([ENDPOINT.article.index]);
  }

  async getArticleDetail(id: string) {
    return this.api.get([ENDPOINT.article.index, id]);
  }
}
