import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../lib/api';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const verify = async () => {
      try {
        await api.get(`/auth/verify-email/${token}`);
        setStatus('success');
        toast.success('Email verified successfully');
      } catch (error) {
        setStatus('error');
        toast.error(error.response?.data?.message || 'Verification failed');
      }
    };

    if (token) {
      verify();
    }
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.3),transparent_55%),linear-gradient(135deg,#020617,#111827)] px-4 py-10">
      <div className="w-full max-w-md rounded-4xl border border-white/10 bg-slate-900/80 p-8 text-center shadow-2xl shadow-black/40">
        {status === 'loading' && <p className="text-slate-300">Verifying your email…</p>}
        {status === 'success' && (
          <>
            <CheckCircle2 className="mx-auto mb-4 text-emerald-400" size={48} />
            <h2 className="text-2xl font-semibold">Email verified</h2>
            <p className="mt-2 text-sm text-slate-400">You can now sign in to LifeOS.</p>
            <button onClick={() => navigate('/')} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-sm font-medium text-white">
              Continue <ArrowRight size={16} />
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="mx-auto mb-4 text-rose-400" size={48} />
            <h2 className="text-2xl font-semibold">Verification failed</h2>
            <p className="mt-2 text-sm text-slate-400">The link may be expired or invalid.</p>
          </>
        )}
      </div>
    </div>
  );
}
