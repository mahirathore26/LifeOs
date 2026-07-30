import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit3,
  Filter,
  FolderKanban,
  List,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Undo2,
  X,
} from 'lucide-react';
import SectionCard from '../components/SectionCard';
import { fetchProjects } from '../features/projects/projectsSlice';
import {
  clearTaskError,
  createTask,
  deleteTask,
  fetchTasks,
  restoreTask,
  updateTask,
} from '../features/tasks/tasksSlice';

const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'todo', label: 'Todo' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

const priorityOptions = [
  { value: '', label: 'All priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const defaultValues = {
  title: '',
  description: '',
  project: '',
  tags: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '',
};

export default function TasksPage() {
  const dispatch = useDispatch();
  const { items, loading, error, pagination } = useSelector((state) => state.tasks);
  const { items: projects } = useSelector((state) => state.projects);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '', project: '', isDeleted: false });
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState('create');
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const form = useForm({ defaultValues });

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(fetchTasks({ page, limit, search: query, ...filters, sortBy, sortOrder }));
    }, 220);

    return () => clearTimeout(timeout);
  }, [dispatch, page, limit, query, filters, sortBy, sortOrder]);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedTaskId && items.length) {
      setSelectedTaskId(items[0]._id);
    }
  }, [items, selectedTaskId]);

  const selectedTask = useMemo(() => items.find((item) => item._id === selectedTaskId) || null, [items, selectedTaskId]);

  const stats = useMemo(() => {
    const completed = items.filter((task) => task.status === 'completed').length;
    const inProgress = items.filter((task) => task.status === 'in_progress').length;
    const overdue = items.filter((task) => task.status !== 'completed' && task.dueDate && new Date(task.dueDate) < new Date()).length;

    return {
      total: items.length,
      completed,
      inProgress,
      overdue,
    };
  }, [items]);

  const sortedItems = useMemo(() => {
    const list = [...items];
    list.sort((left, right) => {
      if (sortBy === 'title') {
        return (left.title || '').localeCompare(right.title || '');
      }

      if (sortBy === 'priority') {
        return (priorityRank[right.priority] || 0) - (priorityRank[left.priority] || 0);
      }

      if (sortBy === 'dueDate') {
        const leftDate = left.dueDate ? new Date(left.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const rightDate = right.dueDate ? new Date(right.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        return leftDate - rightDate;
      }

      return new Date(right.updatedAt || right.createdAt || 0) - new Date(left.updatedAt || left.createdAt || 0);
    });

    if (sortOrder === 'asc') {
      list.reverse();
    }

    return list;
  }, [items, sortBy, sortOrder]);

  const refreshTasks = () => dispatch(fetchTasks({ page, limit, search: query, ...filters, sortBy, sortOrder }));

  const openModal = (task = null) => {
    setMode(task ? 'edit' : 'create');
    setSelectedTaskId(task?._id || null);
    form.reset(
      task
        ? {
            title: task.title || '',
            description: task.description || '',
            project: task.project || '',
            tags: Array.isArray(task.tags) ? task.tags.join(', ') : '',
            status: task.status || 'todo',
            priority: task.priority || 'medium',
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
          }
        : defaultValues
    );
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        project: values.project || null,
        tags: values.tags ? values.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
      };

      if (mode === 'edit' && selectedTask) {
        await dispatch(updateTask({ id: selectedTask._id, payload })).unwrap();
        toast.success('Task updated');
      } else {
        await dispatch(createTask(payload)).unwrap();
        toast.success('Task created');
      }

      setModalOpen(false);
      form.reset(defaultValues);
      setPage(1);
      await dispatch(fetchTasks({ page: 1, limit, search: query, ...filters, sortBy, sortOrder }));
    } catch (error) {
      toast.error(error || 'Task action failed');
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete ${task.title || 'this task'}?`)) return;
    try {
      await dispatch(deleteTask(task._id)).unwrap();
      toast.success('Task deleted');
      await refreshTasks();
    } catch (error) {
      toast.error(error || 'Delete failed');
    }
  };

  const handleRestore = async (task) => {
    try {
      await dispatch(restoreTask(task._id)).unwrap();
      toast.success('Task restored');
      await refreshTasks();
    } catch (error) {
      toast.error(error || 'Restore failed');
    }
  };

  const handleToggleComplete = async (task) => {
    const nextStatus = task.status === 'completed' ? 'todo' : 'completed';
    try {
      await dispatch(updateTask({ id: task._id, payload: { status: nextStatus } })).unwrap();
      toast.success(nextStatus === 'completed' ? 'Task completed' : 'Task reopened');
      await refreshTasks();
    } catch (error) {
      toast.error(error || 'Status update failed');
    }
  };

  return (
    <div className="space-y-6">
      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-4xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Tasks</p>
            <h2 className="mt-2 text-3xl font-semibold">Keep your work moving.</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-400">A focused workspace for planning, prioritizing and following through on what matters most.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => { dispatch(clearTaskError()); refreshTasks(); }} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-4 py-2 text-sm text-slate-200">
              <RefreshCw size={16} />
              Refresh
            </button>
            <button onClick={() => openModal()} className="inline-flex items-center gap-2 rounded-2xl bg-violet-500 px-4 py-2 text-sm font-semibold text-slate-950">
              <Plus size={16} />
              New task
            </button>
          </div>
        </div>
      </motion.section>

      {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Tasks" value={stats.total} icon={List} tone="from-violet-500/20 to-violet-400/10" />
        <MetricCard label="Completed" value={stats.completed} icon={CheckCircle2} tone="from-emerald-500/20 to-emerald-400/10" />
        <MetricCard label="In progress" value={stats.inProgress} icon={Sparkles} tone="from-amber-500/20 to-amber-400/10" />
        <MetricCard label="Overdue" value={stats.overdue} icon={CalendarClock} tone="from-rose-500/20 to-rose-400/10" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="Task library" subtitle="Search, filter and organize your commitments" action={<button onClick={() => openModal()} className="rounded-full border border-white/10 bg-slate-800/70 p-2 text-slate-200"><Plus size={16} /></button>}>
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-300">
              <Search size={16} />
              <input value={query} onChange={(event) => { setPage(1); setQuery(event.target.value); }} className="w-full bg-transparent outline-none" placeholder="Search tasks" />
            </label>
            <div className="flex flex-wrap gap-2">
              <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-300">
                <Filter size={14} />
                <select value={filters.status} onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, status: event.target.value })); }} className="bg-transparent outline-none">
                  {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-300">
                <Filter size={14} />
                <select value={filters.priority} onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, priority: event.target.value })); }} className="bg-transparent outline-none">
                  {priorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-300">
                <FolderKanban size={14} />
                <select value={filters.project} onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, project: event.target.value })); }} className="bg-transparent outline-none">
                  <option value="">All projects</option>
                  {projects.map((project) => <option key={project._id} value={project._id}>{project.name || project.title || project._id}</option>)}
                </select>
              </label>
              <button onClick={() => { setPage(1); setFilters((current) => ({ ...current, isDeleted: !current.isDeleted })); }} className={`rounded-2xl border px-3 py-2 text-sm ${filters.isDeleted ? 'border-amber-400/30 bg-amber-500/10 text-amber-300' : 'border-white/10 bg-slate-800/70 text-slate-300'}`}>
                {filters.isDeleted ? 'Showing deleted' : 'Active only'}
              </button>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-300">
              <Clock3 size={14} />
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="bg-transparent outline-none">
                <option value="updatedAt">Updated</option>
                <option value="title">Title</option>
                <option value="priority">Priority</option>
                <option value="dueDate">Due date</option>
              </select>
            </label>
            <button onClick={() => setSortOrder((current) => (current === 'desc' ? 'asc' : 'desc'))} className="rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-300">
              {sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
            </button>
          </div>

          {loading ? <EmptyState message="Loading tasks…" /> : sortedItems.length === 0 ? <EmptyState message="No tasks match your current filters." /> : <div className="space-y-3">
            {sortedItems.map((task) => (
              <motion.article key={task._id} layout className="rounded-3xl border border-white/10 bg-slate-800/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-100">{task.title}</h4>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] ${task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-300' : task.status === 'in_progress' ? 'bg-amber-500/10 text-amber-300' : 'bg-slate-700/70 text-slate-300'}`}>{statusLabel(task.status)}</span>
                    </div>
                    {task.description ? <p className="mt-2 line-clamp-2 text-sm text-slate-400">{task.description}</p> : null}
                  </div>
                  <button onClick={() => handleToggleComplete(task)} className={`rounded-full p-2 ${task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-900/70 text-slate-300'}`}>
                    <CheckCircle2 size={18} />
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                  <span className="rounded-full border border-white/10 bg-slate-900/70 px-2.5 py-1">{priorityLabel(task.priority)}</span>
                  {task.dueDate ? <span className="rounded-full border border-white/10 bg-slate-900/70 px-2.5 py-1">Due {new Date(task.dueDate).toLocaleDateString()}</span> : null}
                  {task.project ? <span className="rounded-full border border-white/10 bg-slate-900/70 px-2.5 py-1">Project {task.project}</span> : null}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => setSelectedTaskId(task._id)} className="rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200">Open</button>
                  <button onClick={() => openModal(task)} className="rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200"><Edit3 size={14} className="mr-1 inline" />Edit</button>
                  {task.isDeleted ? <button onClick={() => handleRestore(task)} className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"><Undo2 size={14} className="mr-1 inline" />Restore</button> : <button onClick={() => handleDelete(task)} className="rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200"><Trash2 size={14} className="mr-1 inline" />Delete</button>}
                </div>
              </motion.article>
            ))}
          </div>}

          <div className="mt-5 flex items-center justify-between">
            <div className="text-sm text-slate-400">Page {pagination?.page || 1} of {pagination?.totalPages || 1}</div>
            <div className="flex items-center gap-2">
              <button disabled={!pagination?.hasPreviousPage} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-2xl border border-white/10 bg-slate-800/70 p-2 text-slate-300 disabled:opacity-50"><ChevronLeft size={16} /></button>
              <button disabled={!pagination?.hasNextPage} onClick={() => setPage((current) => current + 1)} className="rounded-2xl border border-white/10 bg-slate-800/70 p-2 text-slate-300 disabled:opacity-50"><ChevronRight size={16} /></button>
            </div>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Selected task" subtitle="Review details and update quickly">
            {selectedTask ? <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-100">{selectedTask.title}</h4>
                    <p className="mt-1 text-sm text-slate-400">{selectedTask.description || 'No description added yet.'}</p>
                  </div>
                  <button onClick={() => openModal(selectedTask)} className="rounded-full border border-white/10 bg-slate-900/70 p-2 text-slate-200"><Edit3 size={15} /></button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-300">
                  <span className="rounded-full border border-white/10 bg-slate-900/70 px-2.5 py-1">{statusLabel(selectedTask.status)}</span>
                  <span className="rounded-full border border-white/10 bg-slate-900/70 px-2.5 py-1">{priorityLabel(selectedTask.priority)}</span>
                  {selectedTask.dueDate ? <span className="rounded-full border border-white/10 bg-slate-900/70 px-2.5 py-1">Due {new Date(selectedTask.dueDate).toLocaleDateString()}</span> : null}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoChip label="Project" value={selectedTask.project || 'None'} />
                <InfoChip label="Tags" value={Array.isArray(selectedTask.tags) && selectedTask.tags.length ? selectedTask.tags.join(', ') : 'None'} />
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleToggleComplete(selectedTask)} className="rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200">{selectedTask.status === 'completed' ? 'Reopen task' : 'Mark complete'}</button>
                {selectedTask.isDeleted ? <button onClick={() => handleRestore(selectedTask)} className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"><Undo2 size={14} className="mr-1 inline" />Restore</button> : <button onClick={() => handleDelete(selectedTask)} className="rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200"><Trash2 size={14} className="mr-1 inline" />Delete</button>}
              </div>
            </div> : <EmptyState message="Select a task to inspect it." />}
          </SectionCard>

          <SectionCard title="Quick editor" subtitle="Create or update tasks in one place">
            <button onClick={() => openModal()} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-200">
              <Plus size={16} />
              Open editor
            </button>
          </SectionCard>
        </div>
      </div>

      {modalOpen ? <ModalShell title={mode === 'edit' ? 'Edit task' : 'Create task'} onClose={() => { setModalOpen(false); form.reset(defaultValues); }}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <label className="space-y-1 text-sm text-slate-300">
            <span>Title</span>
            <input {...form.register('title', { required: 'Title is required' })} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none" placeholder="Task title" />
          </label>
          <label className="space-y-1 text-sm text-slate-300">
            <span>Description</span>
            <textarea {...form.register('description')} rows={6} className="min-h-28 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none" placeholder="Capture the details" />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-300">
              <span>Project</span>
              <select {...form.register('project')} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none">
                <option value="">No project</option>
                {projects.map((project) => <option key={project._id} value={project._id}>{project.name || project.title || project._id}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              <span>Tags</span>
              <input {...form.register('tags')} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none" placeholder="Comma separated tag IDs" />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-300">
              <span>Status</span>
              <select {...form.register('status')} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none">
                {statusOptions.filter((option) => option.value).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              <span>Priority</span>
              <select {...form.register('priority')} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none">
                {priorityOptions.filter((option) => option.value).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>
          <label className="space-y-1 text-sm text-slate-300">
            <span>Due date</span>
            <input type="date" {...form.register('dueDate')} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none" />
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => { setModalOpen(false); form.reset(defaultValues); }} className="rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-200">Cancel</button>
            <button type="submit" className="rounded-2xl bg-violet-500 px-3 py-2 text-sm font-semibold text-slate-950">Save</button>
          </div>
        </form>
      </ModalShell> : null}
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, tone }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-linear-to-br ${tone} p-4`}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-300">{label}</p>
        <Icon className="text-slate-200" size={18} />
      </div>
      <p className="mt-6 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

function InfoChip({ label, value }) {
  return <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-3 text-sm text-slate-300"><p className="text-slate-400">{label}</p><p className="mt-1 font-medium text-slate-100">{value}</p></div>;
}

function EmptyState({ message }) {
  return <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-4 text-sm text-slate-400">{message}</div>;
}

function ModalShell({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl shadow-black/40">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          <button onClick={onClose} className="rounded-full border border-white/10 bg-slate-800/70 p-2 text-slate-200"><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const priorityRank = {
  high: 3,
  medium: 2,
  low: 1,
};

function statusLabel(status) {
  switch (status) {
    case 'in_progress':
      return 'In progress';
    case 'completed':
      return 'Completed';
    default:
      return 'Todo';
  }
}

function priorityLabel(priority) {
  switch (priority) {
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    case 'low':
      return 'Low';
    default:
      return 'Medium';
  }
}
