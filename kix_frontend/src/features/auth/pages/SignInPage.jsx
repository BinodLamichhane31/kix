import { SignInForm } from '../components/SignInForm';
import { Link } from 'react-router-dom';
import { appRoutes } from '../../../utils/navigation';

export default function SignInPage() {
  return (
    <section className="min-h-screen pt-24 pb-12 bg-gray-50 dark:bg-brand-black text-gray-900 dark:text-white">
      <div className="grid lg:grid-cols-2 min-h-[calc(100vh-96px)] overflow-hidden">
        {/* Visual Panel */}
        <div className="relative hidden lg:flex items-center justify-center bg-gradient-to-br from-gray-100 via-white to-gray-100 dark:from-brand-black dark:via-brand-gray dark:to-black p-12 transition-colors">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=2070&auto=format&fit=crop')] opacity-20 bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-gray-100/70 to-white/80 dark:from-black/70 dark:via-brand-black/60 dark:to-brand-black/80" />
          </div>

          <div className="relative z-10 max-w-lg space-y-8">
            <p className="text-sm uppercase tracking-[0.3em] text-brand-accent/80 font-semibold">
              KIX EXPERIENCE
            </p>
            <h2 className="text-4xl font-black leading-tight text-gray-900 dark:text-white">
              Unlock the next generation of custom sneakers.
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
              Sign in to access saved builds, live collaboration tools, and early access to limited drops.
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-[0.25em]">
              <span>24K+ Creators</span>
              <span className="w-8 h-px bg-gray-300 dark:bg-gray-600" />
              <span>4.9★ Rated</span>
            </div>
          </div>
        </div>

        {/* Form Panel */}
        <div className="flex items-center justify-center px-4 sm:px-8 py-10 bg-gray-50 dark:bg-brand-black">
          <div className="w-full max-w-md space-y-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-black dark:text-brand-accent text-center lg:text-left">
              Sign in
            </p>
            <h1 className="text-3xl font-black text-center lg:text-left mt-2">
              Welcome back to KIX
            </h1>
          </div>

          <div className="bg-white dark:bg-brand-gray rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl p-6 sm:p-8">
            <SignInForm />
          </div>

          {/* <div className="text-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
            <Link to="/help" className="hover:text-brand-black dark:hover:text-brand-accent transition-colors">
              Support
            </Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-brand-black dark:hover:text-brand-accent transition-colors">
              Contact us
            </Link>
          </div> */}

          {/* <p className="text-xs text-gray-400 text-center">
            Need an account?{' '}
            <Link to={appRoutes.auth.signUp} className="font-semibold text-brand-black dark:text-brand-accent hover:underline">
              Join KIX
            </Link>
          </p> */}
          </div>
        </div>
      </div>
    </section>
  );
}

