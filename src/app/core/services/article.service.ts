import AuthHelper from '../helpers/auth.helper';
import { ENDPOINT } from '@config/endpoint';
import { ApiService } from './api.service';

export class ArticleService extends AuthHelper {
  http = new ApiService();

  constructor() {
    super();
  }

  async getArticleList<T>(): Promise<T> {
    return this.http.get<T>([ENDPOINT.article.articleList]);
  }
}
