import { RouterProvider } from 'react-router-dom'
import router from './routes/router'
import ReduxProvider from './redux/ReduxProvider'
import IpcReceiver from './IpcReceiver';

function App() {
  return (
    <ReduxProvider>
      <RouterProvider router={router} />
      <IpcReceiver />
    </ReduxProvider>
  );
}

export default App
