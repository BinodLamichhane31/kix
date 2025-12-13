import { Navigate } from 'react-router-dom';
import { useAuth } from '../../store/contexts/AuthContext';
import { appRoutes } from '../../utils/navigation';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-brand-black">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-black dark:border-brand-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={appRoutes.auth.signIn} replace />;
  }

  // Check admin requirement
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to={appRoutes.dashboard.root} replace />;
  }

  return children;
}



