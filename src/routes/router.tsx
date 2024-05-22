import { createHashRouter } from 'react-router-dom';
import RootPage from './root';
import NewPage from './new';
import IndexPage, { loader as docsLoader } from './index';
import NotePage, { loader as noteLoader } from './note';


const router = createHashRouter([
  {
    path: '/',
    element: <RootPage />,
    children: [
      { index: true, element: <NewPage /> },
      {
        path: 'note/:noteId',
        loader: noteLoader,
        element: <NotePage />,
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
