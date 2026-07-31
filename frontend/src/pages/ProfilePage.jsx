import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  KeyRound,
  Lock,
  Save,
  ShieldCheck,
  User,
  UserCircle,
} from 'lucide-react';
import SectionCard from '../components/SectionCard';
import api, { extractApiData } from '../lib/api';
import { fetchCurrentUser } from '../features/auth/authSlice';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const profileForm = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      username: user?.username || '',
    },
  });

  const passwordForm = useForm({
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleProfileSave = async (values) => {
    setSavingProfile(true);
    try {
      await api.patch('/auth/profile', {
        fullName: values.fullName.trim(),
        username: values.username.trim(),
      });
      await dispatch(fetchCurrentUser());
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await api.post('/auth/change-password', {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      toast.success('Password changed successfully');
      passwordForm.reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-4xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-500/20 text-2xl font-bold text-violet-300 ring-2 ring-violet-500/20">
              {initials}
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Profile</p>
              <h2 className="mt-1 text-3xl font-semibold">{user?.fullName || 'Your account'}</h2>
              <p className="mt-1 text-sm text-slate-400">{user?.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {user?.isEmailVerified ? (
              <span className="inline-flex items-center gap-1.5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                <ShieldCheck size={15} />
                Email verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
                Email unverified
              </span>
            )}
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Account information"
          subtitle="Update your display name and username"
          action={<User size={18} className="text-slate-400" />}
        >
          <form onSubmit={profileForm.handleSubmit(handleProfileSave)} className="space-y-4">
            <label className="space-y-1 text-sm text-slate-300">
              <span>Full name</span>
              <input
                {...profileForm.register('fullName', { required: 'Full name is required' })}
                className="w-full rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2.5 text-slate-100 outline-none transition focus:border-violet-400/40 focus:bg-slate-800"
                placeholder="Your full name"
              />
              {profileForm.formState.errors.fullName ? (
                <span className="text-xs text-rose-400">{profileForm.formState.errors.fullName.message}</span>
              ) : null}
            </label>

            <label className="space-y-1 text-sm text-slate-300">
              <span>Username</span>
              <input
                {...profileForm.register('username')}
                className="w-full rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2.5 text-slate-100 outline-none transition focus:border-violet-400/40 focus:bg-slate-800"
                placeholder="username"
              />
            </label>

            <label className="space-y-1 text-sm text-slate-300">
              <span>Email</span>
              <input
                value={user?.email || ''}
                disabled
                className="w-full rounded-2xl border border-white/10 bg-slate-900/40 px-3 py-2.5 text-slate-400 outline-none cursor-not-allowed"
              />
            </label>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-2 rounded-2xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-60"
              >
                <Save size={15} />
                {savingProfile ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Change password"
          subtitle="Keep your account secure with a strong password"
          action={<Lock size={18} className="text-slate-400" />}
        >
          <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
            <label className="space-y-1 text-sm text-slate-300">
              <span>Current password</span>
              <input
                type="password"
                {...passwordForm.register('oldPassword', { required: 'Current password is required' })}
                className="w-full rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2.5 text-slate-100 outline-none transition focus:border-violet-400/40 focus:bg-slate-800"
                placeholder="Enter current password"
              />
              {passwordForm.formState.errors.oldPassword ? (
                <span className="text-xs text-rose-400">{passwordForm.formState.errors.oldPassword.message}</span>
              ) : null}
            </label>

            <label className="space-y-1 text-sm text-slate-300">
              <span>New password</span>
              <input
                type="password"
                {...passwordForm.register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                })}
                className="w-full rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2.5 text-slate-100 outline-none transition focus:border-violet-400/40 focus:bg-slate-800"
                placeholder="Enter new password"
              />
              {passwordForm.formState.errors.newPassword ? (
                <span className="text-xs text-rose-400">{passwordForm.formState.errors.newPassword.message}</span>
              ) : null}
            </label>

            <label className="space-y-1 text-sm text-slate-300">
              <span>Confirm new password</span>
              <input
                type="password"
                {...passwordForm.register('confirmPassword', { required: 'Please confirm your new password' })}
                className="w-full rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2.5 text-slate-100 outline-none transition focus:border-violet-400/40 focus:bg-slate-800"
                placeholder="Confirm new password"
              />
              {passwordForm.formState.errors.confirmPassword ? (
                <span className="text-xs text-rose-400">{passwordForm.formState.errors.confirmPassword.message}</span>
              ) : null}
            </label>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="inline-flex items-center gap-2 rounded-2xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-60"
              >
                <KeyRound size={15} />
                {savingPassword ? 'Updating…' : 'Change password'}
              </button>
            </div>
          </form>
        </SectionCard>
      </div>

      <SectionCard
        title="Account overview"
        subtitle="Your workspace at a glance"
        action={<UserCircle size={18} className="text-slate-400" />}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoChip label="Full name" value={user?.fullName || '—'} />
          <InfoChip label="Username" value={user?.username || '—'} />
          <InfoChip label="Email" value={user?.email || '—'} />
          <InfoChip label="Role" value={user?.role || 'User'} />
          <InfoChip label="Email verified" value={user?.isEmailVerified ? 'Yes' : 'No'} />
          <InfoChip
            label="Member since"
            value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
          />
        </div>
      </SectionCard>
    </div>
  );
}

function InfoChip({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-3 text-sm text-slate-300">
      <p className="text-slate-400">{label}</p>
      <p className="mt-1 truncate font-medium text-slate-100">{value}</p>
    </div>
  );
}
