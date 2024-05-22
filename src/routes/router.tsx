import { createHashRouter } from 'react-router-dom';
import RootPage from './root';
import NewPage from './new';
import IndexPage, { loader as docsLoader } from './index';
import ChatPage from './chat';


const router = createHashRouter([
  {
    path: '/',
    element: <RootPage />,
    children: [
      { index: true, element: <NewPage /> },
      {
        path: 'chat/:chatId',
        element: <ChatPage />,
      },
      {
        path: 'all',
        loader: docsLoader,
        element: <IndexPage />,
      },
    ],
  },
]);

export default router;
