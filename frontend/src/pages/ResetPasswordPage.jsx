import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import PasswordInput from '../components/PasswordInput';
import api from '../lib/api';
import { ArrowRight } from 'lucide-react';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({ mode: 'onBlur' });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password: values.password });
      toast.success('Password reset successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.3),transparent_55%),linear-gradient(135deg,#020617,#111827)] px-4 py-10">
      <div className="w-full max-w-md rounded-4xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-black/40">
        <h2 className="text-2xl font-semibold">Reset your password</h2>
        <p className="mt-2 text-sm text-slate-400">Choose a new password to continue.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-1 block text-sm text-slate-400">New password</label>
            <PasswordInput
              error={errors.password}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
              })}
            />
            {errors.password && <p className="mt-1 text-sm text-rose-400">{errors.password.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Confirm password</label>
            <PasswordInput
              error={errors.confirmPassword}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === watch('password') || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-rose-400">{errors.confirmPassword.message}</p>}
          </div>
          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 font-medium text-white transition hover:bg-violet-400">
            {loading ? 'Updating...' : 'Reset password'}
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
