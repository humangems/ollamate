import { RouterProvider } from 'react-router-dom'
import router from './routes/router'
import ReduxProvider from './redux/ReduxProvider'
import IpcReceiver from './IpcReceiver';
import { TooltipProvider } from './components/ui/tooltip';
import ErrorBoundary from './ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ReduxProvider>
        <TooltipProvider>
          <RouterProvider router={router} />
          <IpcReceiver />
        </TooltipProvider>
      </ReduxProvider>
    </ErrorBoundary>
  );
}

export default App
