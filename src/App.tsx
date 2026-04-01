import { RouterProvider } from 'react-router-dom'
import router from './routes/router'
import ReduxProvider from './redux/ReduxProvider'
import IpcReceiver from './IpcReceiver';
import { TooltipProvider } from './components/ui/tooltip';

function App() {
  return (
    <ReduxProvider>
      <TooltipProvider>
        <RouterProvider router={router} />
        <IpcReceiver />
      </TooltipProvider>
    </ReduxProvider>
  );
}

export default App
