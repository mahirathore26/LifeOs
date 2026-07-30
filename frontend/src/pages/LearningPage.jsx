import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  BarChart3,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit3,
  Filter,
  FolderKanban,
  GraduationCap,
  Grid2x2,
  List,
  NotebookPen,
  PlayCircle,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  StickyNote,
  Trash2,
  Undo2,
  X,
} from 'lucide-react';
import SectionCard from '../components/SectionCard';
import {
  createLearningGoal,
  createLearningRevision,
  createLearningResource,
  createLearningSession,
  deleteLearningGoal,
  deleteLearningResource,
  deleteLearningRevision,
  fetchDueRevisions,
  fetchLearningAnalytics,
  fetchLearningGoals,
  fetchLearningStats,
  fetchLearnings,
  markRevisionComplete,
  restoreLearningResource,
  toggleFavoriteLearning,
  updateLearningGoal,
  updateLearningResource,
} from '../features/learning/learningSlice';

const resourceTypes = ['Course', 'Video', 'Article', 'Book', 'Documentation', 'Podcast', 'Other'];
const progressOptions = ['Not Started', 'In Progress', 'Completed'];
const difficultyOptions = ['Beginner', 'Intermediate', 'Advanced'];
const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];
const defaultResourceValues = {
  title: '',
  description: '',
  resourceType: 'Course',
  subject: '',
  difficulty: 'Beginner',
  priority: 'Medium',
  progress: 'Not Started',
  estimatedDurationMinutes: '',
  timeSpentMinutes: '',
  instructor: '',
  platform: '',
  sourceUrl: '',
  personalNotes: '',
  isFavorite: false,
};
const defaultGoalValues = {
  title: '',
  description: '',
  targetDate: '',
  isCompleted: false,
};
const defaultSessionValues = {
  durationMinutes: '',
  notes: '',
  startedAt: '',
};

export default function LearningPage() {
  const dispatch = useDispatch();
  const { items, stats, analytics, goals, dueRevisions, revisionHistory, loading, goalsLoading, revisionsLoading, error, pagination } = useSelector((state) => state.learning);

  const [viewMode, setViewMode] = useState('grid');
  const [resourceQuery, setResourceQuery] = useState('');
  const [filters, setFilters] = useState({ resourceType: '', progress: '', difficulty: '', priority: '', isFavorite: false, isDeleted: false });
  const [sortBy, setSortBy] = useState('updatedAt');
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [selectedResourceId, setSelectedResourceId] = useState(null);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [resourceMode, setResourceMode] = useState('create');
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalMode, setGoalMode] = useState('create');
  const [activeGoalId, setActiveGoalId] = useState(null);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [activeSessionResourceId, setActiveSessionResourceId] = useState(null);
  const [activeSessionStartedAt, setActiveSessionStartedAt] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);

  const resourceForm = useForm({ defaultValues: defaultResourceValues });
  const goalForm = useForm({ defaultValues: defaultGoalValues });
  const sessionForm = useForm({ defaultValues: defaultSessionValues });
  const revisionForm = useForm({ defaultValues: { resourceId: '', scheduledAt: '', note: '' } });

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(fetchLearnings({ page, limit, search: resourceQuery, ...filters }));
    }, 220);

    return () => clearTimeout(timeout);
  }, [dispatch, page, limit, resourceQuery, filters]);

  useEffect(() => {
    dispatch(fetchLearningStats());
    dispatch(fetchLearningAnalytics());
    dispatch(fetchLearningGoals());
    dispatch(fetchDueRevisions());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedResourceId && items.length) {
      setSelectedResourceId(items[0]?._id ?? null);
    }
  }, [items, selectedResourceId]);

  const selectedResource = useMemo(() => items.find((item) => item._id === selectedResourceId) || null, [items, selectedResourceId]);
  const selectedGoal = useMemo(() => goals.find((goal) => goal._id === activeGoalId) || null, [goals, activeGoalId]);
  const selectedSession = useMemo(() => selectedResource?.sessions?.find((session) => session._id === selectedSessionId) || null, [selectedResource, selectedSessionId]);

  const completionBreakdown = useMemo(() => {
    const counts = { Completed: 0, 'In Progress': 0, 'Not Started': 0 };
    items.forEach((item) => {
      counts[item.progress || 'Not Started'] = (counts[item.progress || 'Not Started'] || 0) + 1;
    });
    return counts;
  }, [items]);

  const resourceTypeBreakdown = useMemo(() => {
    const counts = {};
    items.forEach((item) => {
      const type = item.resourceType || 'Other';
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [items]);

  const sortedItems = useMemo(() => {
    const list = [...items];
    list.sort((left, right) => {
      if (sortBy === 'title') return (left.title || '').localeCompare(right.title || '');
      if (sortBy === 'priority') return (priorityRank[right.priority] || 0) - (priorityRank[left.priority] || 0);
      if (sortBy === 'progress') return (progressRank[right.progress] || 0) - (progressRank[left.progress] || 0);
      if (sortBy === 'favorite') return Number(right.isFavorite) - Number(left.isFavorite);
      return new Date(right.updatedAt || right.createdAt || 0) - new Date(left.updatedAt || left.createdAt || 0);
    });
    return list;
  }, [items, sortBy]);

  const refreshData = () => {
    dispatch(fetchLearnings({ page, limit, search: resourceQuery, ...filters }));
    dispatch(fetchLearningStats());
    dispatch(fetchLearningAnalytics());
    dispatch(fetchLearningGoals());
    dispatch(fetchDueRevisions());
  };

  const openResourceModal = (resource = null) => {
    setResourceMode(resource ? 'edit' : 'create');
    setSelectedResourceId(resource?._id || selectedResourceId);
    resourceForm.reset(
      resource
        ? {
            title: resource.title || '',
            description: resource.description || '',
            resourceType: resource.resourceType || 'Course',
            subject: resource.subject || '',
            difficulty: resource.difficulty || 'Beginner',
            priority: resource.priority || 'Medium',
            progress: resource.progress || 'Not Started',
            estimatedDurationMinutes: resource.estimatedDurationMinutes || '',
            timeSpentMinutes: resource.timeSpentMinutes || '',
            instructor: resource.instructor || '',
            platform: resource.platform || '',
            sourceUrl: resource.sourceUrl || '',
            personalNotes: resource.personalNotes || '',
            isFavorite: Boolean(resource.isFavorite),
          }
        : defaultResourceValues
    );
    setResourceModalOpen(true);
  };

  const handleResourceSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        estimatedDurationMinutes: Number(values.estimatedDurationMinutes || 0),
        timeSpentMinutes: Number(values.timeSpentMinutes || 0),
      };
      if (resourceMode === 'edit' && selectedResource) {
        await dispatch(updateLearningResource({ id: selectedResource._id, body: payload })).unwrap();
        toast.success('Resource updated');
      } else {
        await dispatch(createLearningResource(payload)).unwrap();
        toast.success('Resource created');
      }
      setResourceModalOpen(false);
      resourceForm.reset(defaultResourceValues);
    } catch (error) {
      toast.error(error || 'Resource action failed');
    }
  };

  const handleDeleteResource = async (resource) => {
    if (!window.confirm(`Delete ${resource.title || 'this resource'}?`)) return;
    try {
      await dispatch(deleteLearningResource(resource._id)).unwrap();
      toast.success('Resource moved to deleted');
    } catch (error) {
      toast.error(error || 'Delete failed');
    }
  };

  const handleRestoreResource = async (resource) => {
    try {
      await dispatch(restoreLearningResource(resource._id)).unwrap();
      toast.success('Resource restored');
    } catch (error) {
      toast.error(error || 'Restore failed');
    }
  };

  const handleFavoriteToggle = async (resource) => {
    try {
      await dispatch(toggleFavoriteLearning({ id: resource._id, isFavorite: !resource.isFavorite })).unwrap();
      toast.success(resource.isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error(error || 'Favorite update failed');
    }
  };

  const openGoalModal = (goal = null) => {
    setGoalMode(goal ? 'edit' : 'create');
    setActiveGoalId(goal?._id || null);
    goalForm.reset(
      goal
        ? {
            title: goal.title || '',
            description: goal.description || '',
            targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().slice(0, 10) : '',
            isCompleted: Boolean(goal.isCompleted),
          }
        : defaultGoalValues
    );
    setGoalModalOpen(true);
  };

  const handleGoalSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        targetDate: values.targetDate ? new Date(values.targetDate).toISOString() : null,
      };
      if (goalMode === 'edit' && selectedGoal) {
        await dispatch(updateLearningGoal({ id: selectedGoal._id, body: payload })).unwrap();
        toast.success('Goal updated');
      } else {
        await dispatch(createLearningGoal(payload)).unwrap();
        toast.success('Goal created');
      }
      setGoalModalOpen(false);
      goalForm.reset(defaultGoalValues);
      setActiveGoalId(null);
    } catch (error) {
      toast.error(error || 'Goal action failed');
    }
  };

  const handleDeleteGoal = async (goal) => {
    if (!window.confirm(`Delete ${goal.title || 'this goal'}?`)) return;
    try {
      await dispatch(deleteLearningGoal(goal._id)).unwrap();
      toast.success('Goal deleted');
    } catch (error) {
      toast.error(error || 'Delete failed');
    }
  };

  const openSessionModal = (resource = null) => {
    setActiveSessionResourceId(resource?._id || selectedResource?._id || null);
    setSelectedSessionId(null);
    sessionForm.reset({ ...defaultSessionValues, startedAt: new Date().toISOString().slice(0, 16) });
    setSessionModalOpen(true);
  };

  const handleSessionSubmit = async (values) => {
    try {
      const payload = {
        startedAt: values.startedAt ? new Date(values.startedAt).toISOString() : new Date().toISOString(),
        endedAt: values.startedAt ? new Date(values.startedAt).toISOString() : null,
        durationMinutes: Number(values.durationMinutes || 0),
        notes: values.notes || '',
      };
      if (!activeSessionResourceId) {
        toast.error('Select a resource first');
        return;
      }
      await dispatch(createLearningSession({ id: activeSessionResourceId, body: payload })).unwrap();
      toast.success('Session added');
      setSessionModalOpen(false);
      sessionForm.reset(defaultSessionValues);
    } catch (error) {
      toast.error(error || 'Session add failed');
    }
  };

  const startSession = (resource) => {
    setActiveSessionResourceId(resource._id);
    setActiveSessionStartedAt(new Date());
    toast.success(`Session started for ${resource.title}`);
  };

  const endSession = async (resource) => {
    if (!activeSessionStartedAt) {
      toast.error('No active session');
      return;
    }
    const durationMinutes = Math.max(1, Math.round((Date.now() - activeSessionStartedAt.getTime()) / 60000));
    try {
      await dispatch(createLearningSession({ id: resource._id, body: { startedAt: activeSessionStartedAt.toISOString(), endedAt: new Date().toISOString(), durationMinutes, notes: '' } })).unwrap();
      setActiveSessionStartedAt(null);
      toast.success('Session ended');
    } catch (error) {
      toast.error(error || 'Session end failed');
    }
  };

  const openRevisionModal = () => {
    revisionForm.reset({ resourceId: selectedResource?._id || '', scheduledAt: '', note: '' });
    setRevisionModalOpen(true);
  };

  const handleRevisionSubmit = async (values) => {
    try {
      await dispatch(createLearningRevision({ resource: values.resourceId, scheduledAt: values.scheduledAt ? new Date(values.scheduledAt).toISOString() : new Date().toISOString(), note: values.note || '' })).unwrap();
      toast.success('Revision scheduled');
      setRevisionModalOpen(false);
      revisionForm.reset({ resourceId: '', scheduledAt: '', note: '' });
    } catch (error) {
      toast.error(error || 'Revision create failed');
    }
  };

  const handleRevisionComplete = async (revision) => {
    try {
      await dispatch(markRevisionComplete(revision._id)).unwrap();
      toast.success('Revision marked complete');
    } catch (error) {
      toast.error(error || 'Revision update failed');
    }
  };

  const handleRevisionDelete = async (revision) => {
    if (!window.confirm('Delete this revision?')) return;
    try {
      await dispatch(deleteLearningRevision(revision._id)).unwrap();
      toast.success('Revision removed');
    } catch (error) {
      toast.error(error || 'Revision delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-4xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Learning</p>
            <h2 className="mt-2 text-3xl font-semibold">Keep your curiosity organized.</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-400">A premium learning workspace for resources, goals, sessions, revisions and progress tracking.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={refreshData} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-4 py-2 text-sm text-slate-200">
              <RefreshCw size={16} />
              Refresh
            </button>
            <button onClick={() => openResourceModal()} className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950">
              <Plus size={16} />
              New resource
            </button>
          </div>
        </div>
      </motion.section>

      {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Resources" value={stats?.totalResources ?? items.length} icon={BookOpen} tone="from-amber-500/20 to-amber-400/10" />
        <MetricCard label="Time spent" value={`${stats?.totalTimeMinutes ?? 0}m`} icon={Clock3} tone="from-emerald-500/20 to-emerald-400/10" />
        <MetricCard label="Completed" value={stats?.completedResources ?? 0} icon={CheckCircle2} tone="from-sky-500/20 to-sky-400/10" />
        <MetricCard label="Favorites" value={stats?.favorites ?? 0} icon={Star} tone="from-violet-500/20 to-violet-400/10" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="Learning overview" subtitle="Progress summary and momentum">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
              <div className="flex items-center gap-2 text-sm text-slate-400"><BarChart3 size={16} /> Completion</div>
              <p className="mt-3 text-2xl font-semibold">{analytics?.totalSessions30d ?? 0}</p>
              <p className="mt-1 text-sm text-slate-400">Sessions in 30 days</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
              <div className="flex items-center gap-2 text-sm text-slate-400"><Clock3 size={16} /> Average session</div>
              <p className="mt-3 text-2xl font-semibold">{analytics?.avgSessionMinutes ?? 0}m</p>
              <p className="mt-1 text-sm text-slate-400">Average study time</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
              <div className="flex items-center gap-2 text-sm text-slate-400"><GraduationCap size={16} /> Goals</div>
              <p className="mt-3 text-2xl font-semibold">{goals.length}</p>
              <p className="mt-1 text-sm text-slate-400">Active learning goals</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Upcoming revisions" subtitle="Review cadence">
          <div className="space-y-3">
            {revisionsLoading ? <SkeletonLines count={3} /> : dueRevisions.length ? dueRevisions.slice(0, 3).map((revision) => (
              <div key={revision._id} className="rounded-2xl border border-white/10 bg-slate-800/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-100">{items.find((item) => item._id === revision.resource)?.title || 'Revision'}</p>
                    <p className="mt-1 text-sm text-slate-400">Due {new Date(revision.scheduledAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleRevisionComplete(revision)} className="rounded-full border border-emerald-400/20 bg-emerald-500/10 p-2 text-emerald-300">
                      <CheckCircle2 size={15} />
                    </button>
                    <button onClick={() => handleRevisionDelete(revision)} className="rounded-full border border-white/10 bg-slate-900/70 p-2 text-slate-300">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )) : <EmptyState message="No revisions due right now." />}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Learning resources" subtitle="Search, filter, favorite and manage your resources" action={<div className="flex items-center gap-2"><button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="rounded-full border border-white/10 bg-slate-800/70 p-2 text-slate-200">{viewMode === 'grid' ? <Grid2x2 size={16} /> : <List size={16} />}</button><button onClick={() => openResourceModal()} className="rounded-full border border-white/10 bg-slate-800/70 p-2 text-slate-200"><Plus size={16} /></button></div>}>
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-300">
              <Search size={16} />
              <input value={resourceQuery} onChange={(event) => { setPage(1); setResourceQuery(event.target.value); }} placeholder="Search resources" className="w-full bg-transparent outline-none" />
            </label>
            <div className="flex flex-wrap gap-2">
              <select value={filters.resourceType} onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, resourceType: event.target.value })); }} className="rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-300">
                <option value="">Type</option>
                {resourceTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
              <select value={filters.progress} onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, progress: event.target.value })); }} className="rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-300">
                <option value="">Progress</option>
                {progressOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              <button onClick={() => { setPage(1); setFilters((current) => ({ ...current, isFavorite: !current.isFavorite })); }} className={`rounded-2xl border px-3 py-2 text-sm ${filters.isFavorite ? 'border-amber-400/30 bg-amber-500/10 text-amber-300' : 'border-white/10 bg-slate-800/70 text-slate-300'}`}>
                <Star size={14} className="mr-1 inline" />Favorites
              </button>
              <button onClick={() => { setPage(1); setFilters((current) => ({ ...current, isDeleted: !current.isDeleted })); }} className={`rounded-2xl border px-3 py-2 text-sm ${filters.isDeleted ? 'border-violet-400/30 bg-violet-500/10 text-violet-300' : 'border-white/10 bg-slate-800/70 text-slate-300'}`}>
                {filters.isDeleted ? 'Showing deleted' : 'Active only'}
              </button>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-300">
              <Filter size={14} />
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="bg-transparent outline-none">
                <option value="updatedAt">Newest</option>
                <option value="title">Title</option>
                <option value="priority">Priority</option>
                <option value="progress">Progress</option>
                <option value="favorite">Favorites</option>
              </select>
            </label>
          </div>

          {loading ? <SkeletonLines count={4} /> : sortedItems.length === 0 ? <EmptyState message="No resources match your filters yet." /> : <div className={`grid gap-4 ${viewMode === 'grid' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
            {sortedItems.map((resource) => (
              <motion.article key={resource._id} layout className="rounded-3xl border border-white/10 bg-slate-800/70 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-slate-100">{resource.title}</h4>
                      {resource.isFavorite ? <Star className="text-amber-400" size={15} /> : null}
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{resource.subject || resource.resourceType}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs uppercase tracking-[0.2em] ${resource.priority === 'High' || resource.priority === 'Critical' ? 'bg-rose-500/10 text-rose-300' : 'bg-slate-700/70 text-slate-300'}`}>{resource.priority || 'Medium'}</span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-slate-400">{resource.description || 'No description yet.'}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                  <span className="rounded-full border border-white/10 bg-slate-900/70 px-2.5 py-1">{resource.resourceType}</span>
                  <span className="rounded-full border border-white/10 bg-slate-900/70 px-2.5 py-1">{resource.progress}</span>
                  <span className="rounded-full border border-white/10 bg-slate-900/70 px-2.5 py-1">{resource.difficulty}</span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-slate-700">
                  <div className="h-2 rounded-full bg-amber-400" style={{ width: `${Math.min(100, resource.completionPercentage || 0)}%` }} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => setSelectedResourceId(resource._id)} className="rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200">View</button>
                  <button onClick={() => openResourceModal(resource)} className="rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200"><Edit3 size={14} className="mr-1 inline" />Edit</button>
                  {resource.isDeleted ? <button onClick={() => handleRestoreResource(resource)} className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"><Undo2 size={14} className="mr-1 inline" />Restore</button> : <button onClick={() => handleDeleteResource(resource)} className="rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200"><Trash2 size={14} className="mr-1 inline" />Delete</button>}
                  <button onClick={() => handleFavoriteToggle(resource)} className={`rounded-2xl border px-3 py-2 text-sm ${resource.isFavorite ? 'border-amber-400/20 bg-amber-500/10 text-amber-300' : 'border-white/10 bg-slate-900/70 text-slate-200'}`}><Star size={14} className="mr-1 inline" />{resource.isFavorite ? 'Fav' : 'Save'}</button>
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
          <SectionCard title="Resource details" subtitle="Focus on one resource at a time">
            {selectedResource ? <div className="space-y-4"> <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4"><div className="flex items-start justify-between gap-3"><div><h4 className="text-lg font-semibold text-slate-100">{selectedResource.title}</h4><p className="mt-1 text-sm text-slate-400">{selectedResource.subject || selectedResource.resourceType}</p></div><button onClick={() => openResourceModal(selectedResource)} className="rounded-full border border-white/10 bg-slate-900/70 p-2 text-slate-200"><Edit3 size={15} /></button></div><p className="mt-3 text-sm text-slate-400">{selectedResource.description || 'No description yet.'}</p></div><div className="grid gap-3 sm:grid-cols-2"><InfoChip label="Progress" value={selectedResource.progress} /><InfoChip label="Priority" value={selectedResource.priority} /><InfoChip label="Instructor" value={selectedResource.instructor || '—'} /><InfoChip label="Time" value={`${selectedResource.timeSpentMinutes || 0}m spent`} /></div><div className="flex flex-wrap gap-2"><button onClick={() => startSession(selectedResource)} className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"><PlayCircle size={15} />Start session</button><button onClick={() => endSession(selectedResource)} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200"><CheckCircle2 size={15} />End session</button><button onClick={() => openSessionModal(selectedResource)} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200"><NotebookPen size={15} />Add session</button></div><div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4"><div className="flex items-center justify-between"><h5 className="font-semibold text-slate-100">Session history</h5><span className="text-sm text-slate-400">{selectedResource.sessions?.length || 0}</span></div><div className="mt-3 space-y-2">{selectedResource.sessions?.length ? selectedResource.sessions.slice().reverse().slice(0, 3).map((session) => <button key={session._id} onClick={() => setSelectedSessionId(session._id)} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-left text-sm text-slate-300"><span>{new Date(session.startedAt).toLocaleDateString()}</span><span>{session.durationMinutes || 0}m</span></button>) : <EmptyState message="No sessions yet." />}</div></div>{selectedSession ? <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-200"><p className="font-medium text-white">Session details</p><p className="mt-2">{selectedSession.notes || 'No notes for this session.'}</p><p className="mt-2">Duration: {selectedSession.durationMinutes || 0} min</p></div> : null}</div> : <EmptyState message="Pick a resource to inspect." />}</SectionCard>

          <SectionCard title="Learning goals" subtitle="Stay aligned with durable objectives">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-slate-400">{goals.length} goals</p>
              <button onClick={() => openGoalModal()} className="rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-200">New goal</button>
            </div>
            {goalsLoading ? <SkeletonLines count={3} /> : goals.length === 0 ? <EmptyState message="No goals yet." /> : <div className="space-y-3">{goals.map((goal) => {
              const progress = goal.isCompleted ? 100 : Math.min(100, Math.round((goal.resources?.length || 0) * 25));
              return <div key={goal._id} className="rounded-2xl border border-white/10 bg-slate-800/60 p-3"><div className="flex items-start justify-between gap-3"><div><p className="font-medium text-slate-100">{goal.title}</p><p className="mt-1 text-sm text-slate-400">{goal.description || 'No description yet.'}</p></div>{goal.isCompleted ? <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300">Complete</span> : null}</div><div className="mt-3 h-2 rounded-full bg-slate-700"><div className="h-2 rounded-full bg-sky-400" style={{ width: `${progress}%` }} /></div><div className="mt-3 flex items-center justify-between text-sm text-slate-400"><span>{goal.resources?.length || 0} resources</span><div className="flex gap-2"><button onClick={() => { setActiveGoalId(goal._id); openGoalModal(goal); }} className="text-slate-200">Edit</button><button onClick={() => handleDeleteGoal(goal)} className="text-rose-300">Delete</button></div></div></div>;})}</div>}
          </SectionCard>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="Analytics" subtitle="Time spent, topics and completion trends">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
              <p className="text-sm text-slate-400">Resource breakdown</p>
              <div className="mt-4 space-y-2">
                {Object.entries(resourceTypeBreakdown).map(([name, count]) => <div key={name}><div className="mb-1 flex justify-between text-sm text-slate-300"><span>{name}</span><span>{count}</span></div><div className="h-2 rounded-full bg-slate-700"><div className="h-2 rounded-full bg-violet-400" style={{ width: `${Math.min(100, count * 20)}%` }} /></div></div>)}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
              <p className="text-sm text-slate-400">Completion trends</p>
              <div className="mt-4 space-y-2">
                {Object.entries(completionBreakdown).map(([name, count]) => <div key={name}><div className="mb-1 flex justify-between text-sm text-slate-300"><span>{name}</span><span>{count}</span></div><div className="h-2 rounded-full bg-slate-700"><div className="h-2 rounded-full bg-emerald-400" style={{ width: `${Math.min(100, count * 20)}%` }} /></div></div>)}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Revision history" subtitle="Recent review activity" action={<button onClick={() => openRevisionModal()} className="rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-200">Schedule</button>}>
          <div className="space-y-3">
            {revisionHistory.length ? revisionHistory.slice(0, 5).map((revision) => <div key={revision._id} className="rounded-2xl border border-white/10 bg-slate-800/60 p-3"><div className="flex items-center justify-between gap-3"><div><p className="font-medium text-slate-100">{items.find((item) => item._id === revision.resource)?.title || 'Revision'}</p><p className="mt-1 text-sm text-slate-400">{revision.note || 'No note.'}</p></div><div className="text-right text-sm text-slate-400"><p>{new Date(revision.scheduledAt).toLocaleDateString()}</p><p className="mt-1">{revision.isDone ? 'Reviewed' : 'Pending'}</p></div></div></div>) : <EmptyState message="No revision history yet." />}
          </div>
        </SectionCard>
      </div>

      {resourceModalOpen ? <ModalShell title={resourceMode === 'edit' ? 'Edit resource' : 'Create resource'} onClose={() => { setResourceModalOpen(false); resourceForm.reset(defaultResourceValues); }}><form onSubmit={resourceForm.handleSubmit(handleResourceSubmit)} className="space-y-4"><div className="grid gap-4 md:grid-cols-2"><label className="space-y-1 text-sm text-slate-300"><span>Title</span><input {...resourceForm.register('title', { required: 'Title is required' })} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none" placeholder="e.g. Advanced React Patterns" /></label><label className="space-y-1 text-sm text-slate-300"><span>Subject</span><input {...resourceForm.register('subject')} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none" /></label><label className="space-y-1 text-sm text-slate-300"><span>Type</span><select {...resourceForm.register('resourceType')} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none">{resourceTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label><label className="space-y-1 text-sm text-slate-300"><span>Progress</span><select {...resourceForm.register('progress')} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none">{progressOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label><label className="space-y-1 text-sm text-slate-300"><span>Difficulty</span><select {...resourceForm.register('difficulty')} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none">{difficultyOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label><label className="space-y-1 text-sm text-slate-300"><span>Priority</span><select {...resourceForm.register('priority')} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none">{priorityOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label><label className="space-y-1 text-sm text-slate-300"><span>Estimated duration (min)</span><input type="number" {...resourceForm.register('estimatedDurationMinutes')} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none" /></label><label className="space-y-1 text-sm text-slate-300"><span>Time spent (min)</span><input type="number" {...resourceForm.register('timeSpentMinutes')} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none" /></label><label className="space-y-1 text-sm text-slate-300"><span>Instructor</span><input {...resourceForm.register('instructor')} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none" /></label><label className="space-y-1 text-sm text-slate-300"><span>Platform</span><input {...resourceForm.register('platform')} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none" /></label><label className="space-y-1 text-sm text-slate-300 md:col-span-2"><span>Source URL</span><input {...resourceForm.register('sourceUrl')} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none" /></label><label className="space-y-1 text-sm text-slate-300 md:col-span-2"><span>Description</span><textarea {...resourceForm.register('description')} rows={3} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none" /></label><label className="space-y-1 text-sm text-slate-300 md:col-span-2"><span>Personal notes</span><textarea {...resourceForm.register('personalNotes')} rows={3} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none" /></label><label className="flex items-center gap-2 text-sm text-slate-300 md:col-span-2"><input type="checkbox" {...resourceForm.register('isFavorite')} className="h-4 w-4 rounded border-white/10 bg-slate-900" /><span>Favorite this resource</span></label></div><div className="flex justify-end gap-2"><button type="button" onClick={() => { setResourceModalOpen(false); resourceForm.reset(defaultResourceValues); }} className="rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-200">Cancel</button><button type="submit" className="rounded-2xl bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-950">Save</button></div></form></ModalShell> : null}

      {goalModalOpen ? <ModalShell title={goalMode === 'edit' ? 'Edit goal' : 'Create goal'} onClose={() => { setGoalModalOpen(false); goalForm.reset(defaultGoalValues); setActiveGoalId(null); }}><form onSubmit={goalForm.handleSubmit(handleGoalSubmit)} className="space-y-4"><label className="space-y-1 text-sm text-slate-300"><span>Title</span><input {...goalForm.register('title', { required: 'Title is required' })} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none" /></label><label className="space-y-1 text-sm text-slate-300"><span>Description</span><textarea {...goalForm.register('description')} rows={3} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none" /></label><label className="space-y-1 text-sm text-slate-300"><span>Target date</span><input type="date" {...goalForm.register('targetDate')} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none" /></label><label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" {...goalForm.register('isCompleted')} className="h-4 w-4 rounded border-white/10 bg-slate-900" /><span>Completed</span></label><div className="flex justify-end gap-2"><button type="button" onClick={() => { setGoalModalOpen(false); goalForm.reset(defaultGoalValues); setActiveGoalId(null); }} className="rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-200">Cancel</button><button type="submit" className="rounded-2xl bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950">Save</button></div></form></ModalShell> : null}

      {sessionModalOpen ? <ModalShell title="Add session" onClose={() => { setSessionModalOpen(false); sessionForm.reset(defaultSessionValues); }}><form onSubmit={sessionForm.handleSubmit(handleSessionSubmit)} className="space-y-4"><label className="space-y-1 text-sm text-slate-300"><span>Resource</span><select value={activeSessionResourceId || ''} onChange={(event) => setActiveSessionResourceId(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none">{items.map((resource) => <option key={resource._id} value={resource._id}>{resource.title}</option>)}</select></label><label className="space-y-1 text-sm text-slate-300"><span>Started at</span><input type="datetime-local" {...sessionForm.register('startedAt')} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none" /></label><label className="space-y-1 text-sm text-slate-300"><span>Duration (min)</span><input type="number" {...sessionForm.register('durationMinutes')} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none" /></label><label className="space-y-1 text-sm text-slate-300"><span>Notes</span><textarea {...sessionForm.register('notes')} rows={3} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none" /></label><div className="flex justify-end gap-2"><button type="button" onClick={() => { setSessionModalOpen(false); sessionForm.reset(defaultSessionValues); }} className="rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-200">Cancel</button><button type="submit" className="rounded-2xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950">Record</button></div></form></ModalShell> : null}

      {revisionModalOpen ? <ModalShell title="Schedule revision" onClose={() => { setRevisionModalOpen(false); revisionForm.reset({ resourceId: '', scheduledAt: '', note: '' }); }}><form onSubmit={revisionForm.handleSubmit(handleRevisionSubmit)} className="space-y-4"><label className="space-y-1 text-sm text-slate-300"><span>Resource</span><select {...revisionForm.register('resourceId')} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none">{items.map((resource) => <option key={resource._id} value={resource._id}>{resource.title}</option>)}</select></label><label className="space-y-1 text-sm text-slate-300"><span>Scheduled at</span><input type="datetime-local" {...revisionForm.register('scheduledAt')} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none" /></label><label className="space-y-1 text-sm text-slate-300"><span>Note</span><textarea {...revisionForm.register('note')} rows={3} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none" /></label><div className="flex justify-end gap-2"><button type="button" onClick={() => { setRevisionModalOpen(false); revisionForm.reset({ resourceId: '', scheduledAt: '', note: '' }); }} className="rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-200">Cancel</button><button type="submit" className="rounded-2xl bg-violet-500 px-3 py-2 text-sm font-semibold text-slate-950">Save</button></div></form></ModalShell> : null}
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

function SkeletonLines({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-2xl border border-white/10 bg-slate-800/70" />
      ))}
    </div>
  );
}

function ModalShell({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl shadow-black/40">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          <button onClick={onClose} className="rounded-full border border-white/10 bg-slate-800/70 p-2 text-slate-200"><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const priorityRank = { Critical: 4, High: 3, Medium: 2, Low: 1 };
const progressRank = { Completed: 3, 'In Progress': 2, 'Not Started': 1 };
