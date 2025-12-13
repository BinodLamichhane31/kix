import { SignUpForm } from '../components/SignUpForm';
import { Link } from 'react-router-dom';
import { appRoutes } from '../../../utils/navigation';

export default function SignUpPage() {
  return (
    <section className="min-h-screen pt-24 pb-12 bg-gray-50 dark:bg-brand-black text-gray-900 dark:text-white">
      <div className="grid lg:grid-cols-2 min-h-[calc(100vh-96px)] overflow-hidden">
        {/* Visual Panel */}
        <div className="relative hidden lg:flex items-center justify-center bg-gradient-to-br from-gray-100 via-white to-gray-100 dark:from-brand-black dark:via-brand-gray dark:to-black p-12 transition-colors">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514986888952-8cd320577b68?q=80&w=2070&auto=format&fit=crop')] opacity-20 bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-gray-100/70 to-white/80 dark:from-black/70 dark:via-brand-black/60 dark:to-brand-black/80" />
          </div>

          <div className="relative z-10 max-w-lg space-y-8">
            <p className="text-sm uppercase tracking-[0.3em] text-brand-accent/80 font-semibold">
              Join the movement
            </p>
            <h2 className="text-4xl font-black leading-tight text-gray-900 dark:text-white">
              Create bold custom sneakers with the world’s best tools.
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
              Design on your terms, collaborate with stylists, and unlock member-only drops.
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-[0.25em]">
              <span>Early Drops</span>
              <span className="w-8 h-px bg-gray-300 dark:bg-gray-600" />
              <span>Priority Support</span>
            </div>
          </div>
        </div>

        {/* Form Panel */}
        <div className="flex items-center justify-center px-4 sm:px-8 py-10 bg-gray-50 dark:bg-brand-black">
          <div className="w-full max-w-md space-y-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-black dark:text-brand-accent text-center lg:text-left">
              Sign up
            </p>
            <h1 className="text-3xl font-black text-center lg:text-left mt-2">
              Create your KIX profile
            </h1>
          </div>

          <div className="bg-white dark:bg-brand-gray rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl p-6 sm:p-8">
            <SignUpForm />
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
            Already part of KIX?{' '}
            <Link to={appRoutes.auth.signIn} className="font-semibold text-brand-black dark:text-brand-accent hover:underline">
              Sign in
            </Link>
          </p> */}
          </div>
        </div>
      </div>
    </section>
  );
}

