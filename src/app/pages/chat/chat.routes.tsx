import React from 'react';
import { PageRoute } from '../../core/modules/custom-router-dom/router.interface';

const Chat = React.lazy(() => import('./containers/Chat'));
const ChatRoomDetail = React.lazy(() => import('./containers/ChatRoomDetail'));
const EmptyChatRoute = React.lazy(() => import('./containers/EmptyChatRoute'));

const chatRoutes: PageRoute[] = [
  {
    path: '/chat',
    element: Chat,
    isProtected: true,
    children: [
      { path: '', element: EmptyChatRoute },
      { path: 'rooms/:roomId', element: ChatRoomDetail },
    ],
  },
];

export default chatRoutes;
