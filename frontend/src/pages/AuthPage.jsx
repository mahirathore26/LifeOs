import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ArrowRight, Mail, Sparkles, ShieldCheck } from 'lucide-react';
import { loginUser, registerUser, clearAuthError, forgotPassword, resendVerificationEmail } from '../features/auth/authSlice';
import PasswordInput from '../components/PasswordInput';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [view, setView] = useState('form');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, message } = useSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm({ mode: 'onBlur' });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearAuthError());
    }
  }, [message, dispatch]);

  const passwordStrength = useMemo(() => {
    const value = watch('password') || '';
    if (value.length >= 12) return { label: 'Strong', color: 'text-emerald-400' };
    if (value.length >= 8) return { label: 'Good', color: 'text-amber-400' };
    return { label: 'Weak', color: 'text-slate-400' };
  }, [watch('password')]);

  const onSubmit = async (values) => {
    if (mode === 'login') {
      await dispatch(loginUser({ email: values.email, password: values.password }));
    } else if (mode === 'register') {
      await dispatch(registerUser({ fullName: values.fullName, username: values.username, email: values.email, password: values.password }));
    }
    reset();
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    const email = watch('forgotEmail');
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }
    await dispatch(forgotPassword({ email }));
  };

  const handleResendVerification = async () => {
    const email = watch('verifyEmail');
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    await dispatch(resendVerificationEmail({ email }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.3),transparent_55%),linear-gradient(135deg,#020617,#111827)] px-4 py-10">
      <div className="w-full max-w-5xl overflow-hidden rounded-4xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="bg-linear-to-br from-violet-600/20 via-slate-900 to-slate-950 p-8 sm:p-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-sm text-violet-200">
              <Sparkles size={16} />
              Designed for calm focus
            </div>
            <h1 className="text-3xl font-semibold sm:text-4xl">Bring your work, notes, and learning into one polished system.</h1>
            <p className="mt-4 max-w-xl text-sm text-slate-300 sm:text-base">LifeOS combines tasks, notes, projects, documents, and learning into an elegant personal operating system for modern work.</p>
            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/50 p-3"><ShieldCheck size={16} className="text-emerald-400" /> Cookie-based sessions and protected routes</div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/50 p-3"><Mail size={16} className="text-violet-400" /> Secure verification and password recovery</div>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            <div className="mb-6 flex rounded-full border border-white/10 bg-slate-800/60 p-1">
              <button className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${mode === 'login' ? 'bg-white text-slate-900' : 'text-slate-300'}`} onClick={() => { setMode('login'); setView('form'); }}>Login</button>
              <button className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${mode === 'register' ? 'bg-white text-slate-900' : 'text-slate-300'}`} onClick={() => { setMode('register'); setView('form'); }}>Register</button>
            </div>

            {view === 'form' ? (
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                {mode === 'register' && (
                  <>
                    <div>
                      <label className="mb-1 block text-sm text-slate-400">Full name</label>
                      <input {...register('fullName', { required: 'Full name is required', minLength: { value: 2, message: 'Use at least 2 characters' } })} className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm outline-none" placeholder="Alex Morgan" />
                      {errors.fullName && <p className="mt-1 text-sm text-rose-400">{errors.fullName.message}</p>}
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-slate-400">Username</label>
                      <input {...register('username', { required: 'Username is required', pattern: { value: /^[a-z0-9_]+$/i, message: 'Use letters, numbers, or underscores' } })} className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm outline-none" placeholder="alex_01" />
                      {errors.username && <p className="mt-1 text-sm text-rose-400">{errors.username.message}</p>}
                    </div>
                  </>
                )}
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Email</label>
                  <input type="email" {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' } })} className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm outline-none" placeholder="you@example.com" />
                  {errors.email && <p className="mt-1 text-sm text-rose-400">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Password</label>
                  <PasswordInput error={errors.password} {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } })} />
                  {errors.password ? <p className="mt-1 text-sm text-rose-400">{errors.password.message}</p> : mode === 'register' ? <p className={`mt-1 text-sm ${passwordStrength.color}`}>{passwordStrength.label} password</p> : null}
                </div>
                <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 font-medium text-white transition hover:bg-violet-400" disabled={loading}>
                  {loading ? 'Working...' : mode === 'login' ? 'Sign in' : 'Create account'}
                  <ArrowRight size={18} />
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
                  <h3 className="text-lg font-semibold">Forgot password</h3>
                  <p className="mt-1 text-sm text-slate-400">Enter your email to receive reset instructions.</p>
                  <input type="email" {...register('forgotEmail')} className="mt-3 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none" placeholder="your@email.com" />
                  <button onClick={handleForgotPassword} className="mt-3 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900">Send reset link</button>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
                  <h3 className="text-lg font-semibold">Resend verification</h3>
                  <p className="mt-1 text-sm text-slate-400">Need a fresh verification email?</p>
                  <input type="email" {...register('verifyEmail')} className="mt-3 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none" placeholder="your@email.com" />
                  <button onClick={handleResendVerification} className="mt-3 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-200">Resend email</button>
                </div>
                <button onClick={() => setView('form')} className="text-sm text-slate-400">Back to sign in</button>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
              <button onClick={() => setView(view === 'form' ? 'help' : 'form')} className="transition hover:text-white">{view === 'form' ? 'Need help?' : 'Back to form'}</button>
              <p className="text-slate-500">LifeOS uses secure cookies for sessions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
