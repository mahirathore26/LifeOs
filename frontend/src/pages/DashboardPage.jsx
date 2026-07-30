import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchDashboardOverview } from '../features/dashboard/dashboardSlice';
import SectionCard from '../components/SectionCard';
import { BookOpen, CheckCircle2, Clock3, FolderKanban, GraduationCap, ListTodo, NotebookPen, RefreshCw, Search, Sparkles, StickyNote, Files, CalendarClock } from 'lucide-react';

const statMeta = [
  { key: 'learning', label: 'Learning Resources', icon: GraduationCap, color: 'from-violet-500/20 to-violet-400/10' },
  { key: 'tasks', label: 'Active Tasks', icon: ListTodo, color: 'from-emerald-500/20 to-emerald-400/10' },
  { key: 'projects', label: 'Active Projects', icon: FolderKanban, color: 'from-sky-500/20 to-sky-400/10' },
  { key: 'notes', label: 'Notes', icon: StickyNote, color: 'from-amber-500/20 to-amber-400/10' },
  { key: 'documents', label: 'Documents', icon: Files, color: 'from-fuchsia-500/20 to-fuchsia-400/10' },
];

const quickActions = [
  { label: 'Add Note', icon: NotebookPen, to: '/notes' },
  { label: 'Add Task', icon: CheckCircle2, to: '/tasks' },
  { label: 'Add Project', icon: FolderKanban, to: '/projects' },
  { label: 'Add Learning Resource', icon: BookOpen, to: '/learning' },
];

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { overview, loading, error } = useSelector((state) => state.dashboard);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDashboardOverview());
  }, [dispatch]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const refresh = () => dispatch(fetchDashboardOverview());

  if (loading && !overview) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
          <div className="h-4 w-28 animate-pulse rounded bg-slate-800" />
          <div className="mt-3 h-8 w-64 animate-pulse rounded bg-slate-800" />
          <div className="mt-3 h-4 w-96 animate-pulse rounded bg-slate-800" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-3xl border border-white/10 bg-slate-900/70" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-violet-300">LifeOS Dashboard</p>
            <h2 className="mt-2 text-3xl font-semibold">{greeting}, {user?.fullName?.split(' ')[0] || 'there'}.</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-400">A calm overview of your momentum across learning, tasks, projects, notes and documents.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => navigate('/search')} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-4 py-2 text-sm text-slate-200">
              <Search size={16} />
              Search
            </button>
            <button onClick={refresh} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-4 py-2 text-sm text-slate-200">
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </motion.section>

      {error ? (
        <div className="rounded-3xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {statMeta.map(({ key, label, icon: Icon, color }) => {
          const value = overview?.[key] ?? (key === 'learning' ? overview?.learning?.totalResources : 0);
          const display = key === 'learning' ? overview?.learning?.totalResources ?? 0 : key === 'tasks' ? overview?.productivity?.pendingTasks ?? 0 : key === 'projects' ? overview?.projectProgress?.length ?? 0 : key === 'notes' ? overview?.recentNotes?.length ?? 0 : overview?.documents?.totalDocuments ?? 0;
          return (
            <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`rounded-3xl border border-white/10 bg-linear-to-br ${color} p-4`}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-300">{label}</p>
                <Icon className="text-slate-200" size={18} />
              </div>
              <p className="mt-6 text-3xl font-semibold">{display}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <SectionCard title="Learning Overview" subtitle="Your current momentum across learning resources and review cycles">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Progress</p>
                <Sparkles className="text-violet-400" size={16} />
              </div>
              <p className="mt-3 text-2xl font-semibold">{overview?.learning?.completed ?? 0}/{overview?.learning?.totalResources ?? 0}</p>
              <p className="mt-1 text-sm text-slate-400">Completed resources</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Time spent learning</p>
                <Clock3 className="text-emerald-400" size={16} />
              </div>
              <p className="mt-3 text-2xl font-semibold">{overview?.learning?.totalMinutes ?? 0}m</p>
              <p className="mt-1 text-sm text-slate-400">Tracked learning time</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Current goals</p>
                <BookOpen className="text-sky-400" size={16} />
              </div>
              <p className="mt-3 text-2xl font-semibold">{overview?.learning?.favorites ?? 0}</p>
              <p className="mt-1 text-sm text-slate-400">Saved favorites</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Upcoming revisions</p>
                <CalendarClock className="text-amber-400" size={16} />
              </div>
              <p className="mt-3 text-2xl font-semibold">{overview?.learning?.upcomingRevisions ?? 0}</p>
              <p className="mt-1 text-sm text-slate-400">Due soon</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Productivity Summary" subtitle="Your workday pulse">
          <div className="space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-3">Completion rate: <span className="ml-2 font-semibold text-white">{overview?.productivity?.completionRate ?? 0}%</span></div>
            <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-3">Due today: <span className="ml-2 font-semibold text-white">{overview?.productivity?.dueTodayTasks ?? 0}</span></div>
            <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-3">Overdue: <span className="ml-2 font-semibold text-white">{overview?.productivity?.overdueTasks ?? 0}</span></div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Recent Activity" subtitle="The latest things you touched">
          <div className="space-y-3">
            {overview?.pendingTasks?.length ? overview.pendingTasks.slice(0, 4).map((task) => (
              <div key={task._id} className="flex items-start justify-between rounded-2xl border border-white/10 bg-slate-800/60 p-3">
                <div>
                  <p className="font-medium text-slate-100">{task.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{task.project?.name || 'No project'}</p>
                </div>
                <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-xs uppercase tracking-[0.2em] text-violet-300">{task.priority || 'medium'}</span>
              </div>
            )) : <EmptyState message="No active tasks right now." />}
          </div>
        </SectionCard>

        <SectionCard title="Quick Actions" subtitle="Jump into your next move">
          <div className="grid gap-3 sm:grid-cols-2">
            {quickActions.map(({ label, icon: Icon, to }) => (
              <button key={label} onClick={() => navigate(to)} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-800/60 p-3 text-left text-sm text-slate-200 transition hover:bg-slate-800">
                <Icon size={16} className="text-violet-400" />
                {label}
              </button>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Recent Notes" subtitle="Your latest scattered thoughts">
          <div className="space-y-3">
            {overview?.recentNotes?.length ? overview.recentNotes.slice(0, 4).map((note) => (
              <div key={note._id} className="rounded-2xl border border-white/10 bg-slate-800/60 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-100">{note.title}</p>
                  {note.isPinned ? <Sparkles className="text-amber-400" size={16} /> : null}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-400">{note.content || 'No content yet.'}</p>
              </div>
            )) : <EmptyState message="Capture your first note." />}
          </div>
        </SectionCard>

        <SectionCard title="Recent Projects" subtitle="The workstreams that are moving">
          <div className="space-y-3">
            {overview?.projectProgress?.length ? overview.projectProgress.slice(0, 4).map((project) => (
              <div key={project._id} className="rounded-2xl border border-white/10 bg-slate-800/60 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-100">{project.name}</p>
                  <span className="text-sm text-slate-400">{project.progress?.percentage ?? 0}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-700">
                  <div className="h-2 rounded-full bg-violet-500" style={{ width: `${project.progress?.percentage ?? 0}%` }} />
                </div>
              </div>
            )) : <EmptyState message="No projects yet." />}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Recent Learning Sessions" subtitle="The newest additions to your study trail">
        <div className="space-y-3">
          {overview?.learning?.recent?.length ? overview.learning.recent.map((item) => (
            <div key={item._id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-800/60 p-3">
              <div>
                <p className="font-medium text-slate-100">{item.title}</p>
                <p className="mt-1 text-sm text-slate-400">{item.progress} · {item.completionPercentage ?? 0}% complete</p>
              </div>
              <span className="text-sm text-slate-400">{new Date(item.updatedAt).toLocaleDateString()}</span>
            </div>
          )) : <EmptyState message="No recent learning sessions yet." />}
        </div>
      </SectionCard>
    </div>
  );
}

function EmptyState({ message }) {
  return <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-4 text-sm text-slate-400">{message}</div>;
}
