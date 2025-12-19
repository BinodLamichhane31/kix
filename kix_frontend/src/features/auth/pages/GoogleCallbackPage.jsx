import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../store/contexts/AuthContext';
import { apiRequest, setToken } from '../../../services/api/client';
import { appRoutes } from '../../../utils/navigation';

export default function GoogleCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (!token) {
        setError('Missing token from Google sign-in. Please try again.');
        return;
      }

      try {
        // Store token, then fetch user info
        setToken(token);
        const response = await apiRequest('/auth/me');
        if (response.success && response.data?.user) {
          login(token, response.data.user);
          const redirectPath =
            response.data.user.role === 'admin'
              ? appRoutes.admin.dashboard
              : appRoutes.dashboard.root;
          navigate(redirectPath, { replace: true });
        } else {
          setError('Failed to load your account after Google sign-in.');
        }
      } catch (err) {
        setError(err.message || 'Google sign-in failed. Please try again.');
      }
    };

    handleCallback();
  }, [location.search, login, navigate]);

  if (error) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-brand-black text-gray-900 dark:text-white">
        <div className="max-w-md w-full bg-white dark:bg-brand-gray rounded-3xl border border-red-200 dark:border-red-800/60 p-8 shadow-xl space-y-4">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertCircle size={24} />
            <h1 className="text-lg font-bold">Google sign-in failed</h1>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{error}</p>
          <button
            onClick={() => navigate(appRoutes.auth.signIn)}
            className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-xl bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black text-sm font-semibold hover:bg-brand-accent dark:hover:bg-white transition-colors"
          >
            Back to sign in
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-brand-black text-gray-900 dark:text-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin" size={32} />
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Finishing Google sign-in. Please wait...
        </p>
      </div>
    </section>
  );
}




