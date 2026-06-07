import chatRoutes from './chat/chat.routes';
import errorRoutes from './error/error.routes';
import { PageRoute } from '@app/core/modules/custom-router-dom/router.interface';

const pageRoutes: PageRoute[] = [
  ...chatRoutes,
  { path: '/', redirect: '/chat' },
  ...errorRoutes,
];

export default pageRoutes;
