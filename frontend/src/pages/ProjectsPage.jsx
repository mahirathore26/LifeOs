import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  Archive,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit3,
  Filter,
  FolderKanban,
  Grid2x2,
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
import {
  archiveProject,
  clearProjectError,
  createProject,
  deleteProject,
  fetchProjects,
  unarchiveProject,
  updateProject,
} from '../features/projects/projectsSlice';

const defaultValues = {
  name: '',
  description: '',
  color: '#2563eb',
  icon: 'folder',
};

export default function ProjectsPage() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.projects);
  const [viewMode, setViewMode] = useState('grid');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ isArchived: false });
  const [sortBy, setSortBy] = useState('updatedAt');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState('create');

  const form = useForm({ defaultValues });

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(fetchProjects({ search: query, isArchived: filters.isArchived }));
    }, 220);

    return () => clearTimeout(timeout);
  }, [dispatch, query, filters]);

  useEffect(() => {
    if (!selectedProjectId && items.length) {
      setSelectedProjectId(items[0]._id);
    }
  }, [items, selectedProjectId]);

  const selectedProject = useMemo(() => items.find((item) => item._id === selectedProjectId) || null, [items, selectedProjectId]);

  const stats = useMemo(() => {
    const active = items.filter((project) => !project.isArchived).length;
    const archived = items.filter((project) => project.isArchived).length;
    const completed = items.filter((project) => project.progress?.percentage === 100).length;
    return { total: items.length, active, archived, completed };
  }, [items]);

  const sortedItems = useMemo(() => {
    const list = [...items];
    list.sort((left, right) => {
      if (sortBy === 'name') {
        return (left.name || '').localeCompare(right.name || '');
      }
      if (sortBy === 'progress') {
        return (right.progress?.percentage || 0) - (left.progress?.percentage || 0);
      }
      return new Date(right.updatedAt || right.createdAt || 0) - new Date(left.updatedAt || left.createdAt || 0);
    });
    return list;
  }, [items, sortBy]);

  const refreshProjects = () => dispatch(fetchProjects({ search: query, isArchived: filters.isArchived }));

  const openModal = (project = null) => {
    setMode(project ? 'edit' : 'create');
    setSelectedProjectId(project?._id || selectedProjectId);
    form.reset(
      project
        ? {
            name: project.name || '',
            description: project.description || '',
            color: project.color || '#2563eb',
            icon: project.icon || 'folder',
          }
        : defaultValues
    );
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (mode === 'edit' && selectedProject) {
        await dispatch(updateProject({ id: selectedProject._id, payload: values })).unwrap();
        toast.success('Project updated');
      } else {
        await dispatch(createProject(values)).unwrap();
        toast.success('Project created');
      }
      setModalOpen(false);
      form.reset(defaultValues);
      await refreshProjects();
    } catch (error) {
      toast.error(error || 'Project action failed');
    }
  };

  const handleArchiveToggle = async (project) => {
    try {
      if (project.isArchived) {
        await dispatch(unarchiveProject(project._id)).unwrap();
        toast.success('Project unarchived');
      } else {
        await dispatch(archiveProject(project._id)).unwrap();
        toast.success('Project archived');
      }
      await refreshProjects();
    } catch (error) {
      toast.error(error || 'Archive action failed');
    }
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Delete ${project.name || 'this project'}?`)) return;
    try {
      await dispatch(deleteProject(project._id)).unwrap();
      toast.success('Project deleted');
      await refreshProjects();
    } catch (error) {
      toast.error(error || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-4xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Projects</p>
            <h2 className="mt-2 text-3xl font-semibold">Build momentum around every milestone.</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-400">A calm project management workspace for planning, tracking, and staying aligned.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => { dispatch(clearProjectError()); refreshProjects(); }} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-4 py-2 text-sm text-slate-200">
              <RefreshCw size={16} />
              Refresh
            </button>
            <button onClick={() => openModal()} className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950">
              <Plus size={16} />
              New project
            </button>
          </div>
        </div>
      </motion.section>

      {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Projects" value={stats.total} icon={FolderKanban} tone="from-sky-500/20 to-sky-400/10" />
        <MetricCard label="Active" value={stats.active} icon={Sparkles} tone="from-emerald-500/20 to-emerald-400/10" />
        <MetricCard label="Archived" value={stats.archived} icon={Archive} tone="from-amber-500/20 to-amber-400/10" />
        <MetricCard label="Completed" value={stats.completed} icon={CheckCircle2} tone="from-violet-500/20 to-violet-400/10" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="Project library" subtitle="Search, filter, and navigate your workstreams" action={<div className="flex items-center gap-2"><button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="rounded-full border border-white/10 bg-slate-800/70 p-2 text-slate-200">{viewMode === 'grid' ? <Grid2x2 size={16} /> : <List size={16} />}</button><button onClick={() => openModal()} className="rounded-full border border-white/10 bg-slate-800/70 p-2 text-slate-200"><Plus size={16} /></button></div>}>
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-300">
              <Search size={16} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent outline-none" placeholder="Search projects" />
            </label>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setFilters((current) => ({ ...current, isArchived: !current.isArchived }))} className={`rounded-2xl border px-3 py-2 text-sm ${filters.isArchived ? 'border-amber-400/30 bg-amber-500/10 text-amber-300' : 'border-white/10 bg-slate-800/70 text-slate-300'}`}>
                {filters.isArchived ? 'Showing archived' : 'Active only'}
              </button>
              <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-300">
                <Filter size={14} />
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="bg-transparent outline-none">
                  <option value="updatedAt">Recently updated</option>
                  <option value="name">Name</option>
                  <option value="progress">Progress</option>
                </select>
              </label>
            </div>
          </div>

          {loading ? <EmptyState message="Loading projects…" /> : sortedItems.length === 0 ? <EmptyState message="No projects match your current filters." /> : <div className={`grid gap-4 ${viewMode === 'grid' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
            {sortedItems.map((project) => (
              <motion.article key={project._id} layout className="rounded-3xl border border-white/10 bg-slate-800/70 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-2xl p-2" style={{ backgroundColor: `${project.color || '#2563eb'}22` }}>
                        <Sparkles size={16} style={{ color: project.color || '#2563eb' }} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-100">{project.name}</h4>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{project.isArchived ? 'Archived' : 'Active'}</p>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm text-slate-400">{project.description || 'A focused workspace for your next milestone.'}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                    <span>Progress</span>
                    <span>{project.progress?.percentage ?? 0}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-900/80">
                    <div className="h-2 rounded-full" style={{ width: `${project.progress?.percentage ?? 0}%`, backgroundColor: project.color || '#2563eb' }} />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                  <span className="rounded-full border border-white/10 bg-slate-900/70 px-2.5 py-1">{project.progress?.completedTasks ?? 0}/{project.progress?.totalTasks ?? 0} tasks</span>
                  <span className="rounded-full border border-white/10 bg-slate-900/70 px-2.5 py-1">{project.relations?.notesCount ?? 0} notes</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => setSelectedProjectId(project._id)} className="rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200">Open</button>
                  <button onClick={() => openModal(project)} className="rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200"><Edit3 size={14} className="mr-1 inline" />Edit</button>
                  <button onClick={() => handleArchiveToggle(project)} className={`rounded-2xl border px-3 py-2 text-sm ${project.isArchived ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-slate-900/70 text-slate-200'}`}>{project.isArchived ? <Undo2 size={14} className="mr-1 inline" /> : <Archive size={14} className="mr-1 inline" />}{project.isArchived ? 'Unarchive' : 'Archive'}</button>
                </div>
              </motion.article>
            ))}
          </div>}
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Selected project" subtitle="Review details and quick actions">
            {selectedProject ? <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-100">{selectedProject.name}</h4>
                    <p className="mt-1 text-sm text-slate-400">{selectedProject.description || 'No description yet.'}</p>
                  </div>
                  <button onClick={() => openModal(selectedProject)} className="rounded-full border border-white/10 bg-slate-900/70 p-2 text-slate-200"><Edit3 size={15} /></button>
                </div>
                <div className="mt-4 h-2 rounded-full bg-slate-900/80">
                  <div className="h-2 rounded-full" style={{ width: `${selectedProject.progress?.percentage ?? 0}%`, backgroundColor: selectedProject.color || '#2563eb' }} />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <InfoChip label="Tasks" value={`${selectedProject.progress?.completedTasks ?? 0}/${selectedProject.progress?.totalTasks ?? 0}`} />
                  <InfoChip label="Notes" value={selectedProject.relations?.notesCount ?? 0} />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoChip label="Created" value={selectedProject.createdAt ? new Date(selectedProject.createdAt).toLocaleDateString() : '—'} />
                <InfoChip label="Updated" value={selectedProject.updatedAt ? new Date(selectedProject.updatedAt).toLocaleDateString() : '—'} />
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleArchiveToggle(selectedProject)} className={`rounded-2xl border px-3 py-2 text-sm ${selectedProject.isArchived ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-slate-900/70 text-slate-200'}`}>{selectedProject.isArchived ? <Undo2 size={14} className="mr-1 inline" /> : <Archive size={14} className="mr-1 inline" />}{selectedProject.isArchived ? 'Unarchive' : 'Archive'}</button>
                <button onClick={() => handleDelete(selectedProject)} className="rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200"><Trash2 size={14} className="mr-1 inline" />Delete</button>
              </div>
            </div> : <EmptyState message="Select a project to inspect it." />}
          </SectionCard>

          <SectionCard title="Quick editor" subtitle="Create or update projects in one place">
            <button onClick={() => openModal()} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-200">
              <Plus size={16} />
              Open editor
            </button>
          </SectionCard>
        </div>
      </div>

      {modalOpen ? <ModalShell title={mode === 'edit' ? 'Edit project' : 'Create project'} onClose={() => { setModalOpen(false); form.reset(defaultValues); }}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <label className="space-y-1 text-sm text-slate-300">
            <span>Name</span>
            <input {...form.register('name', { required: 'Name is required' })} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none" placeholder="Project name" />
          </label>
          <label className="space-y-1 text-sm text-slate-300">
            <span>Description</span>
            <textarea {...form.register('description')} rows={5} className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none" placeholder="What is this project about?" />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-300">
              <span>Color</span>
              <input type="color" {...form.register('color')} className="h-11 w-full rounded-2xl border border-white/10 bg-slate-900/80 p-1" />
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              <span>Icon</span>
              <input {...form.register('icon')} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none" placeholder="folder" />
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => { setModalOpen(false); form.reset(defaultValues); }} className="rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-200">Cancel</button>
            <button type="submit" className="rounded-2xl bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950">Save</button>
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
