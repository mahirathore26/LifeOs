import { NavLink, Outlet } from 'react-router-dom';
import { Home, CheckSquare, StickyNote, FolderKanban, GraduationCap, Search, LogOut, Sparkles, FileText, User, Tag } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutLocal } from '../features/auth/authSlice';
import api from '../lib/api';
import { toast } from 'react-hot-toast';

const links = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/notes', label: 'Notes', icon: StickyNote },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/learning', label: 'Learning', icon: GraduationCap },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/tags', label: 'Tags', icon: Tag },
  { to: '/search', label: 'Search', icon: Search },
];

export default function Layout() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      dispatch(logoutLocal());
      toast.success('Signed out');
    } catch {
      dispatch(logoutLocal());
      toast.error('Signed out locally');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        <aside className="w-full border-b border-white/10 bg-slate-900/80 p-4 backdrop-blur lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-2xl bg-violet-500/20 p-2 text-violet-300">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">LifeOS</p>
              <h1 className="text-lg font-semibold">Personal OS</h1>
            </div>
          </div>

          <nav className="space-y-2">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${isActive ? 'bg-violet-500/20 text-violet-200' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-white/10 bg-slate-800/70 p-4">
            <p className="text-sm font-medium">{user?.fullName || 'Welcome back'}</p>
            <p className="mt-1 text-sm text-slate-400">{user?.email || 'Ready to focus'}</p>
            <div className="mt-4 flex flex-col gap-2">
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 ${isActive ? 'bg-violet-500/10 text-violet-200' : ''}`
                }
              >
                <User size={16} />
                Profile
              </NavLink>
              <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5">
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
