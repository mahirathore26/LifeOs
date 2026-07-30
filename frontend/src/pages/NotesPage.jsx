import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FileText,
  Filter,
  Grid2x2,
  List,
  Pin,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  Undo2,
  X,
} from 'lucide-react';
import SectionCard from '../components/SectionCard';
import {
  archiveNote,
  createNote,
  deleteNote,
  fetchNotes,
  pinNote,
  restoreNote,
  unarchiveNote,
  unpinNote,
  updateNote,
} from '../features/notes/notesSlice';

const defaultValues = {
  title: '',
  content: '',
  project: '',
  isPinned: false,
  isArchived: false,
};

export default function NotesPage() {
  const dispatch = useDispatch();
  const { items, loading, error, pagination } = useSelector((state) => state.notes);
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ isPinned: false, isArchived: false, isDeleted: false });
  const [sortBy, setSortBy] = useState('updatedAt');
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState('create');

  const form = useForm({ defaultValues });

  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch(fetchNotes({ page, limit, search, ...filters }));
    }, 220);
    return () => clearTimeout(handler);
  }, [dispatch, page, limit, search, filters]);

  useEffect(() => {
    if (!selectedNoteId && items.length) {
      setSelectedNoteId(items[0]._id);
    }
  }, [items, selectedNoteId]);

  const selectedNote = useMemo(() => items.find((item) => item._id === selectedNoteId) || null, [items, selectedNoteId]);

  const stats = useMemo(() => ({
    total: items.length,
    pinned: items.filter((note) => note.isPinned).length,
    archived: items.filter((note) => note.isArchived).length,
    favorites: items.filter((note) => note.isFavorite).length,
  }), [items]);

  const refreshNotes = () => dispatch(fetchNotes({ page, limit, search, ...filters }));

  const openModal = (note = null) => {
    setMode(note ? 'edit' : 'create');
    setSelectedNoteId(note?._id || selectedNoteId);
    form.reset(note ? {
      title: note.title || '',
      content: note.content || '',
      project: note.project || '',
      isPinned: Boolean(note.isPinned),
      isArchived: Boolean(note.isArchived),
    } : defaultValues);
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        project: values.project || null,
        title: values.title.trim(),
        content: values.content.trim(),
      };
      if (mode === 'edit' && selectedNote) {
        await dispatch(updateNote({ id: selectedNote._id, payload })).unwrap();
        toast.success('Note updated');
      } else {
        await dispatch(createNote(payload)).unwrap();
        toast.success('Note created');
      }
      setModalOpen(false);
      form.reset(defaultValues);
    } catch (error) {
      toast.error(error || 'Note action failed');
    }
  };

  const handleDelete = async (note) => {
    if (!window.confirm(`Delete ${note.title || 'this note'}?`)) return;
    try {
      await dispatch(deleteNote(note._id)).unwrap();
      toast.success('Note deleted');
    } catch (error) {
      toast.error(error || 'Delete failed');
    }
  };

  const handleRestore = async (note) => {
    try {
      await dispatch(restoreNote(note._id)).unwrap();
      toast.success('Note restored');
    } catch (error) {
      toast.error(error || 'Restore failed');
    }
  };

  const handleArchiveToggle = async (note) => {
    try {
      if (note.isArchived) {
        await dispatch(unarchiveNote(note._id)).unwrap();
        toast.success('Note restored to active');
      } else {
        await dispatch(archiveNote(note._id)).unwrap();
        toast.success('Note archived');
      }
    } catch (error) {
      toast.error(error || 'Archive action failed');
    }
  };

  const handlePinToggle = async (note) => {
    try {
      if (note.isPinned) {
        await dispatch(unpinNote(note._id)).unwrap();
        toast.success('Pin removed');
      } else {
        await dispatch(pinNote(note._id)).unwrap();
        toast.success('Note pinned');
      }
    } catch (error) {
      toast.error(error || 'Pin action failed');
    }
  };

  const sortedItems = useMemo(() => {
    const list = [...items];
    list.sort((left, right) => {
      if (sortBy === 'title') return (left.title || '').localeCompare(right.title || '');
      if (sortBy === 'updatedAt') return new Date(right.updatedAt || 0) - new Date(left.updatedAt || 0);
      if (sortBy === 'pinned') return Number(right.isPinned) - Number(left.isPinned);
      return new Date(right.updatedAt || 0) - new Date(left.updatedAt || 0);
    });
    return list;
  }, [items, sortBy]);

  return (
    <div className="space-y-6">
      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-4xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Notes</p>
            <h2 className="mt-2 text-3xl font-semibold">Capture thoughts with clarity.</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-400">A polished space to write, organize, and revisit your ideas without losing momentum.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={refreshNotes} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-4 py-2 text-sm text-slate-200">
              <RefreshCw size={16} />
              Refresh
            </button>
            <button onClick={() => openModal()} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">
              <Plus size={16} />
              New note
            </button>
          </div>
        </div>
      </motion.section>

      {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Notes" value={stats.total} icon={FileText} tone="from-emerald-500/20 to-emerald-400/10" />
        <MetricCard label="Pinned" value={stats.pinned} icon={Pin} tone="from-violet-500/20 to-violet-400/10" />
        <MetricCard label="Archived" value={stats.archived} icon={Archive} tone="from-sky-500/20 to-sky-400/10" />
        <MetricCard label="Favorites" value={stats.favorites} icon={Star} tone="from-amber-500/20 to-amber-400/10" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="Note library" subtitle="Search, filter and organize your thoughts" action={<div className="flex items-center gap-2"><button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="rounded-full border border-white/10 bg-slate-800/70 p-2 text-slate-200">{viewMode === 'grid' ? <Grid2x2 size={16} /> : <List size={16} />}</button><button onClick={() => openModal()} className="rounded-full border border-white/10 bg-slate-800/70 p-2 text-slate-200"><Plus size={16} /></button></div>}>
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-300">
              <Search size={16} />
              <input value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} className="w-full bg-transparent outline-none" placeholder="Search notes" />
            </label>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { setPage(1); setFilters((current) => ({ ...current, isPinned: !current.isPinned })); }} className={`rounded-2xl border px-3 py-2 text-sm ${filters.isPinned ? 'border-violet-400/30 bg-violet-500/10 text-violet-300' : 'border-white/10 bg-slate-800/70 text-slate-300'}`}>
                <Pin size={14} className="mr-1 inline" />Pinned
              </button>
              <button onClick={() => { setPage(1); setFilters((current) => ({ ...current, isArchived: !current.isArchived })); }} className={`rounded-2xl border px-3 py-2 text-sm ${filters.isArchived ? 'border-sky-400/30 bg-sky-500/10 text-sky-300' : 'border-white/10 bg-slate-800/70 text-slate-300'}`}>
                <Archive size={14} className="mr-1 inline" />Archived
              </button>
              <button onClick={() => { setPage(1); setFilters((current) => ({ ...current, isDeleted: !current.isDeleted })); }} className={`rounded-2xl border px-3 py-2 text-sm ${filters.isDeleted ? 'border-amber-400/30 bg-amber-500/10 text-amber-300' : 'border-white/10 bg-slate-800/70 text-slate-300'}`}>
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
                <option value="pinned">Pinned</option>
              </select>
            </label>
          </div>

          {loading ? <SkeletonLines count={4} /> : sortedItems.length === 0 ? <EmptyState message="No notes match your current filters." /> : <div className={`grid gap-4 ${viewMode === 'grid' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
            {sortedItems.map((note) => (
              <motion.article key={note._id} layout className="rounded-3xl border border-white/10 bg-slate-800/70 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-100">{note.title}</h4>
                      {note.isPinned ? <Pin className="text-violet-400" size={15} /> : null}
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{new Date(note.updatedAt || note.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs uppercase tracking-[0.2em] ${note.isArchived ? 'bg-sky-500/10 text-sky-300' : 'bg-emerald-500/10 text-emerald-300'}`}>{note.isArchived ? 'Archived' : 'Active'}</span>
                </div>
                <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm text-slate-400">{note.content || 'No content yet.'}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => setSelectedNoteId(note._id)} className="rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200">Open</button>
                  <button onClick={() => openModal(note)} className="rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200"><Edit3 size={14} className="mr-1 inline" />Edit</button>
                  {note.isDeleted ? <button onClick={() => handleRestore(note)} className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"><Undo2 size={14} className="mr-1 inline" />Restore</button> : <button onClick={() => handleDelete(note)} className="rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200"><Trash2 size={14} className="mr-1 inline" />Delete</button>}
                  <button onClick={() => handlePinToggle(note)} className={`rounded-2xl border px-3 py-2 text-sm ${note.isPinned ? 'border-violet-400/20 bg-violet-500/10 text-violet-300' : 'border-white/10 bg-slate-900/70 text-slate-200'}`}><Pin size={14} className="mr-1 inline" />{note.isPinned ? 'Unpin' : 'Pin'}</button>
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
          <SectionCard title="Selected note" subtitle="Quick inspect and edit">
            {selectedNote ? <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-100">{selectedNote.title}</h4>
                    <p className="mt-1 text-sm text-slate-400">{selectedNote.project ? 'Linked project' : 'Quick note'}</p>
                  </div>
                  <button onClick={() => openModal(selectedNote)} className="rounded-full border border-white/10 bg-slate-900/70 p-2 text-slate-200"><Edit3 size={15} /></button>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-slate-400">{selectedNote.content || 'No content yet.'}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoChip label="Pinned" value={selectedNote.isPinned ? 'Yes' : 'No'} />
                <InfoChip label="Archived" value={selectedNote.isArchived ? 'Yes' : 'No'} />
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handlePinToggle(selectedNote)} className={`rounded-2xl border px-3 py-2 text-sm ${selectedNote.isPinned ? 'border-violet-400/20 bg-violet-500/10 text-violet-300' : 'border-white/10 bg-slate-900/70 text-slate-200'}`}><Pin size={14} className="mr-1 inline" />{selectedNote.isPinned ? 'Unpin' : 'Pin'}</button>
                <button onClick={() => handleArchiveToggle(selectedNote)} className={`rounded-2xl border px-3 py-2 text-sm ${selectedNote.isArchived ? 'border-sky-400/20 bg-sky-500/10 text-sky-300' : 'border-white/10 bg-slate-900/70 text-slate-200'}`}><Archive size={14} className="mr-1 inline" />{selectedNote.isArchived ? 'Unarchive' : 'Archive'}</button>
                {selectedNote.isDeleted ? <button onClick={() => handleRestore(selectedNote)} className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"><Undo2 size={14} className="mr-1 inline" />Restore</button> : <button onClick={() => handleDelete(selectedNote)} className="rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200"><Trash2 size={14} className="mr-1 inline" />Delete</button>}
              </div>
            </div> : <EmptyState message="Select a note to preview it." />}
          </SectionCard>

          <SectionCard title="Quick editor" subtitle="Create or update notes in one place">
            <button onClick={() => openModal()} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-200">
              <Plus size={16} />
              Open editor
            </button>
          </SectionCard>
        </div>
      </div>

      {modalOpen ? <ModalShell title={mode === 'edit' ? 'Edit note' : 'Create note'} onClose={() => { setModalOpen(false); form.reset(defaultValues); }}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <label className="space-y-1 text-sm text-slate-300">
            <span>Title</span>
            <input {...form.register('title', { required: 'Title is required' })} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none" placeholder="Note title" />
          </label>
          <label className="space-y-1 text-sm text-slate-300">
            <span>Content</span>
            <textarea {...form.register('content')} rows={10} className="min-h-40 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none" placeholder="Write something meaningful…" />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-300">
              <span>Project ID</span>
              <input {...form.register('project')} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none" placeholder="Optional project id" />
            </label>
            <div className="space-y-3 text-sm text-slate-300">
              <label className="flex items-center gap-2"><input type="checkbox" {...form.register('isPinned')} className="h-4 w-4 rounded border-white/10 bg-slate-900" /><span>Pin note</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" {...form.register('isArchived')} className="h-4 w-4 rounded border-white/10 bg-slate-900" /><span>Archive note</span></label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => { setModalOpen(false); form.reset(defaultValues); }} className="rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-200">Cancel</button>
            <button type="submit" className="rounded-2xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950">Save</button>
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
