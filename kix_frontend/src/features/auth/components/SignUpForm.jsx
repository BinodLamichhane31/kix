import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../store/contexts/AuthContext';
import { appRoutes } from '../../../utils/navigation';
import { apiRequest } from '../../../services/api/client';
import Toast from '../../../components/common/Toast';

export function SignUpForm() {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5050/api';
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showToast, setShowToast] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // At least 6 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    return passwordRegex.test(password);
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Weak', color: 'red' };
    if (password.length < 8 || !validatePassword(password)) return { strength: 2, label: 'Medium', color: 'yellow' };
    if (validatePassword(password)) return { strength: 3, label: 'Strong', color: 'green' };
    return { strength: 2, label: 'Medium', color: 'yellow' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (submitError) setSubmitError('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.success && response.data) {
        // Store token and user data
        login(response.data.token, response.data.user);
        
        // Show success toast
        setShowToast(true);
        
        // Navigate based on user role (new signups are typically 'user' role)
        const redirectPath = response.data.user?.role === 'admin' 
          ? appRoutes.admin.dashboard 
          : appRoutes.dashboard.root;
        
        // Navigate after a brief delay to show toast
        setTimeout(() => {
          navigate(redirectPath);
        }, 1000);
      } else {
        // Handle validation errors from backend
        if (response.errors && Array.isArray(response.errors)) {
          const errorMessages = response.errors.map(err => err.msg || err.message).join(', ');
          setSubmitError(errorMessages);
        } else {
          setSubmitError(response.message || 'Something went wrong. Please try again.');
        }
      }
    } catch (error) {
      setSubmitError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Continue with Google */}
      <button
        type="button"
        className="w-full border border-gray-200 dark:border-white/10 rounded-2xl py-3 px-4 flex items-center justify-center gap-3 font-semibold text-gray-700 dark:text-gray-100 bg-white dark:bg-brand-black hover:border-brand-black/50 dark:hover:border-brand-accent/60 transition-all"
        onClick={() => {
          const backendUrl = `${API_BASE_URL}/auth/google`;
          window.location.href = backendUrl;
        }}
      >
        <img
          src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
          alt="Google"
          className="w-5 h-5"
        />
        Continue with Google
      </button>

      {/* Divider */}
      {/* <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
          or
        </span>
        <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
      </div> */}
      {/* Social Login */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
            Or continue with email
          </span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
        </div>
      </div>

      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
          Full Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <User size={20} className="text-gray-400 dark:text-gray-500" />
          </div>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-brand-black border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
              errors.name
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-200 dark:border-white/10 focus:border-brand-black dark:focus:border-brand-accent focus:ring-brand-accent/20'
            }`}
            placeholder="John Doe"
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
        </div>
        {errors.name && (
          <p id="name-error" className="mt-2 text-sm text-red-500 flex items-center gap-1" role="alert">
            <AlertCircle size={14} />
            {errors.name}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail size={20} className="text-gray-400 dark:text-gray-500" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-brand-black border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
              errors.email
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-200 dark:border-white/10 focus:border-brand-black dark:focus:border-brand-accent focus:ring-brand-accent/20'
            }`}
            placeholder="you@example.com"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
        </div>
        {errors.email && (
          <p id="email-error" className="mt-2 text-sm text-red-500 flex items-center gap-1" role="alert">
            <AlertCircle size={14} />
            {errors.email}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock size={20} className="text-gray-400 dark:text-gray-500" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full pl-12 pr-12 py-3 bg-white dark:bg-brand-black border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
              errors.password
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-200 dark:border-white/10 focus:border-brand-black dark:focus:border-brand-accent focus:ring-brand-accent/20'
            }`}
            placeholder="Create a strong password"
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error' : 'password-strength'}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {/* Password Strength Indicator */}
        {formData.password && (
          <div id="password-strength" className="mt-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex-1 h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    passwordStrength.color === 'red' ? 'bg-red-500' :
                    passwordStrength.color === 'yellow' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                />
              </div>
              {passwordStrength.label && (
                <span className={`text-xs font-semibold ${
                  passwordStrength.color === 'red' ? 'text-red-500' :
                  passwordStrength.color === 'yellow' ? 'text-yellow-500' :
                  'text-green-500'
                }`}>
                  {passwordStrength.label}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Must contain uppercase, lowercase, and number
            </p>
          </div>
        )}
        {errors.password && (
          <p id="password-error" className="mt-2 text-sm text-red-500 flex items-center gap-1" role="alert">
            <AlertCircle size={14} />
            {errors.password}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock size={20} className="text-gray-400 dark:text-gray-500" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full pl-12 pr-12 py-3 bg-white dark:bg-brand-black border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
              errors.confirmPassword
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                : formData.confirmPassword && formData.password === formData.confirmPassword
                ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                : 'border-gray-200 dark:border-white/10 focus:border-brand-black dark:focus:border-brand-accent focus:ring-brand-accent/20'
            }`}
            placeholder="Re-enter your password"
            aria-invalid={errors.confirmPassword ? 'true' : 'false'}
            aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
          <p className="mt-2 text-sm text-green-500 flex items-center gap-1">
            <CheckCircle2 size={14} />
            Passwords match
          </p>
        )}
        {errors.confirmPassword && (
          <p id="confirm-password-error" className="mt-2 text-sm text-red-500 flex items-center gap-1" role="alert">
            <AlertCircle size={14} />
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Terms and Conditions */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={agreeToTerms}
            onChange={(e) => {
              setAgreeToTerms(e.target.checked);
              if (errors.terms) {
                setErrors(prev => ({ ...prev, terms: '' }));
              }
            }}
            className="mt-1 w-4 h-4 text-brand-black dark:text-brand-accent border-gray-300 dark:border-white/20 rounded focus:ring-2 focus:ring-brand-accent focus:ring-offset-0"
            aria-invalid={errors.terms ? 'true' : 'false'}
          />
          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
            I agree to the{' '}
            <Link to="/terms" className="font-semibold text-brand-black dark:text-brand-accent hover:underline">
              Terms and Conditions
            </Link>
            {' '}and{' '}
            <Link to="/privacy" className="font-semibold text-brand-black dark:text-brand-accent hover:underline">
              Privacy Policy
            </Link>
          </span>
        </label>
        {errors.terms && (
          <p className="mt-2 text-sm text-red-500 flex items-center gap-1" role="alert">
            <AlertCircle size={14} />
            {errors.terms}
          </p>
        )}
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl" role="alert">
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle size={16} />
            {submitError}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-brand-black dark:bg-white text-white dark:text-brand-black font-bold py-4 px-6 rounded-xl hover:bg-brand-accent dark:hover:bg-brand-accent transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>Creating account...</span>
          </>
        ) : (
          'Create Account'
        )}
      </button>

      {/* Sign In Link */}
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link
          to={appRoutes.auth.signIn}
          className="font-bold text-brand-black dark:text-brand-accent hover:underline transition-colors"
        >
          Sign in
        </Link>
      </p>

      {/* Success Toast */}
      <Toast
        message="Account created successfully! Welcome to KIX."
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type="success"
      />
    </form>
  );
}

