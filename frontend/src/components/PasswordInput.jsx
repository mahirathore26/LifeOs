import { Eye, EyeOff } from 'lucide-react';
import { forwardRef, useState } from 'react';

const PasswordInput = forwardRef(function PasswordInput({ error, ...props }, ref) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        ref={ref}
        {...props}
        type={showPassword ? 'text' : 'password'}
        className={`w-full rounded-xl border bg-slate-800 px-4 py-3 pr-12 text-sm text-slate-100 outline-none transition ${error ? 'border-rose-400' : 'border-white/10'}`}
      />
      <button
        type="button"
        onClick={() => setShowPassword((value) => !value)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
});

export default PasswordInput;
