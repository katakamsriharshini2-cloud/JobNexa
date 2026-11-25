import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import {
  Briefcase,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Sparkles,
  KeyRound,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: localStorage.getItem('jobnexa_remembered_email') || '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('jobnexa_remember_me') === 'true');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: request, 2: reset
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState({ type: '', text: '' });

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await authService.login(formData);
      if (res.success && res.token && res.user) {
        if (rememberMe) {
          localStorage.setItem('jobnexa_remember_me', 'true');
          localStorage.setItem('jobnexa_remembered_email', formData.email);
        } else {
          localStorage.removeItem('jobnexa_remember_me');
          localStorage.removeItem('jobnexa_remembered_email');
        }
        login(res.token, res.user);
        
        // Redirect based on role or original intended location
        if (location.state?.from?.pathname) {
          navigate(location.state.from.pathname);
        } else if (res.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (res.user.role === 'recruiter') {
          navigate('/recruiter/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        setError(res.message || 'Login failed. Please verify credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials or server connectivity.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Step 1: Request Token
  const handleForgotRequest = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotMsg({ type: 'error', text: 'Please enter your registered email address.' });
      return;
    }

    try {
      setForgotLoading(true);
      setForgotMsg({ type: '', text: '' });
      const res = await authService.forgotPassword(forgotEmail);
      if (res.success) {
        setForgotStep(2);
        if (res.resetToken) {
          setResetToken(res.resetToken);
        }
        setForgotMsg({
          type: 'success',
          text: 'Reset token generated! Enter your new password below.',
        });
      } else {
        setForgotMsg({ type: 'error', text: res.message || 'Failed to process request.' });
      }
    } catch (err) {
      setForgotMsg({
        type: 'error',
        text: err.response?.data?.message || 'No user registered with this email address.',
      });
    } finally {
      setForgotLoading(false);
    }
  };

  // Forgot Password Step 2: Reset Password
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setForgotMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setForgotMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    try {
      setForgotLoading(true);
      setForgotMsg({ type: '', text: '' });
      const res = await authService.resetPassword(resetToken, newPassword);
      if (res.success && res.token && res.user) {
        setForgotMsg({ type: 'success', text: 'Password reset successful! Logging you in...' });
        setTimeout(() => {
          login(res.token, res.user);
          setForgotModalOpen(false);
          if (res.user.role === 'recruiter') {
            navigate('/recruiter/dashboard');
          } else if (res.user.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/student/dashboard');
          }
        }, 1200);
      } else {
        setForgotMsg({ type: 'error', text: res.message || 'Password reset failed.' });
      }
    } catch (err) {
      setForgotMsg({
        type: 'error',
        text: err.response?.data?.message || 'Invalid or expired reset token.',
      });
    } finally {
      setForgotLoading(false);
    }
  };

  // Demo prefill helper - fills email only; password must be entered manually for security
  const handlePrefill = (email) => {
    setFormData((prev) => ({ ...prev, email, password: '' }));
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-4">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome to JobNexa
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Sign in to access your student, recruiter, or admin dashboard.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center space-x-2 text-xs font-semibold text-rose-700 dark:text-rose-300 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 transition-colors">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotModalOpen(true);
                    setForgotStep(1);
                    setForgotEmail(formData.email || '');
                    setForgotMsg({ type: '', text: '' });
                  }}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
              />
              <label htmlFor="remember-me" className="ml-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                Remember me on this browser
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Registration link */}
          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have a JobNexa account yet?{' '}
            <Link to="/register" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Create an account
            </Link>
          </div>
        </div>

        {/* Demo Credentials Box for Testing / Viva Demonstration */}
        <div className="bg-blue-50 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 rounded-2xl p-4">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 mb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Quick Demo Access (Click to prefill email)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handlePrefill('student@jobnexa.dev')}
              className="px-2.5 py-1.5 text-[11px] font-semibold bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 text-center transition-all"
            >
              Student Demo
            </button>
            <button
              type="button"
              onClick={() => handlePrefill('recruiter@jobnexa.dev')}
              className="px-2.5 py-1.5 text-[11px] font-semibold bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-purple-500 hover:text-purple-600 text-center transition-all"
            >
              Recruiter Demo
            </button>
            <button
              type="button"
              onClick={() => handlePrefill('admin@jobnexa.dev')}
              className="px-2.5 py-1.5 text-[11px] font-semibold bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-indigo-500 hover:text-indigo-600 text-center transition-all"
            >
              Admin Demo
            </button>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-center">
            Enter your password to sign in to the prefilled account.
          </p>
        </div>

      </div>

      {/* FORGOT PASSWORD MODAL */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Reset Password</h3>
              </div>
              <button
                onClick={() => setForgotModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotMsg.text && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
                  forgotMsg.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300'
                }`}
              >
                {forgotMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{forgotMsg.text}</span>
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotRequest} className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your registered JobNexa email address to generate a password reset authorization code.
                </p>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {forgotLoading ? 'Processing...' : 'Generate Reset Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Reset Token / Code
                  </label>
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Enter reset token"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {forgotLoading ? 'Updating Password...' : 'Save New Password & Sign In'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;
