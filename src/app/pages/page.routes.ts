import { PageRoute } from '@core/modules/custom-router-dom/router.interface';
import chatRoutes from './chat/chat.routes';
import errorRoutes from './error/error.routes';

const pageRoutes: PageRoute[] = [
  ...chatRoutes,
  { path: '/', redirect: '/chat' },
  ...errorRoutes,
];

export default pageRoutes;
