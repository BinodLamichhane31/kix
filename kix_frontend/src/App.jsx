import AppProviders from './providers/AppProviders'
import AppRouter from './routes/AppRouter'
import { ToastContainer } from './components/common/ToastContainer'
import { useToast } from './store/contexts/ToastContext'

function AppContent() {
  const { toasts, removeToast } = useToast();
  
  return (
    <>
      <AppRouter />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}

export default function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}
