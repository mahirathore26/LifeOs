import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  CheckSquare,
  Edit3,
  Hash,
  Plus,
  RefreshCw,
  Search,
  StickyNote,
  Tag as TagIcon,
  Trash2,
  X,
} from 'lucide-react';
import SectionCard from '../components/SectionCard';
import {
  clearTagError,
  createTag,
  deleteTag,
  fetchTags,
  renameTag,
} from '../features/tags/tagsSlice';

const DEFAULT_COLORS = [
  '#8b5cf6', // Violet
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#64748b', // Slate
];

export default function TagsPage() {
  const dispatch = useDispatch();
  const { items: tags, loading, error } = useSelector((state) => state.tags);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);

  const form = useForm({
    defaultValues: { name: '' },
  });

  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);

  const filteredTags = tags.filter(
    (tag) =>
      tag.name?.toLowerCase().includes(query.toLowerCase()) ||
      tag.slug?.toLowerCase().includes(query.toLowerCase())
  );

  const openModal = (tag = null) => {
    setEditingTag(tag);
    setSelectedColor(tag?.color || DEFAULT_COLORS[0]);
    form.reset({ name: tag ? tag.name : '' });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingTag) {
        await dispatch(
          renameTag({ id: editingTag._id, payload: { name: values.name.trim(), color: selectedColor } })
        ).unwrap();
        toast.success('Tag updated successfully');
      } else {
        await dispatch(
          createTag({ name: values.name.trim(), color: selectedColor })
        ).unwrap();
        toast.success('Tag created successfully');
      }
      setModalOpen(false);
      form.reset({ name: '' });
    } catch (err) {
      toast.error(err || 'Failed to save tag');
    }
  };

  const handleDelete = async (tag) => {
    if (!window.confirm(`Delete tag "${tag.name}"? This will unassign it from all notes and tasks.`))
      return;
    try {
      await dispatch(deleteTag(tag._id)).unwrap();
      toast.success('Tag deleted');
    } catch (err) {
      toast.error(err || 'Failed to delete tag');
    }
  };

  const totalNotesUsage = tags.reduce((acc, t) => acc + (t.usage?.notesCount || 0), 0);
  const totalTasksUsage = tags.reduce((acc, t) => acc + (t.usage?.tasksCount || 0), 0);

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-4xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Tags</p>
            <h2 className="mt-2 text-3xl font-semibold">Organize with custom tags.</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-400">
              Categorize and link tasks and notes dynamically using custom tags.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                dispatch(clearTagError());
                dispatch(fetchTags());
              }}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-4 py-2 text-sm text-slate-200"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              <Plus size={16} />
              New tag
            </button>
          </div>
        </div>
      </motion.section>

      {error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total Tags" value={tags.length} icon={TagIcon} tone="from-cyan-500/20 to-cyan-400/10" />
        <MetricCard label="Notes Tagged" value={totalNotesUsage} icon={StickyNote} tone="from-emerald-500/20 to-emerald-400/10" />
        <MetricCard label="Tasks Tagged" value={totalTasksUsage} icon={CheckSquare} tone="from-violet-500/20 to-violet-400/10" />
      </div>

      <SectionCard
        title="Tag repository"
        subtitle="Manage tag names, colors, and resource assignments"
        action={
          <button onClick={() => openModal()} className="rounded-full border border-white/10 bg-slate-800/70 p-2 text-slate-200">
            <Plus size={16} />
          </button>
        }
      >
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-300">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent outline-none"
            placeholder="Search tags by name or slug"
          />
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">Loading tags…</div>
        ) : filteredTags.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
            No tags found. Create a tag to start organizing your workspace.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTags.map((tag) => (
              <motion.div
                key={tag._id}
                layout
                className="rounded-3xl border border-white/10 bg-slate-800/70 p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-3.5 w-3.5 shrink-0 rounded-full"
                      style={{ backgroundColor: tag.color || '#8b5cf6' }}
                    />
                    <h4 className="font-semibold text-slate-100 truncate">{tag.name}</h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openModal(tag)}
                      className="rounded-xl border border-white/10 bg-slate-900/60 p-1.5 text-slate-300 hover:text-white"
                      title="Edit"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(tag)}
                      className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-1.5 text-rose-300 hover:bg-rose-500/20"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Hash size={12} />
                  <span>{tag.slug}</span>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <StickyNote size={12} />
                    {tag.usage?.notesCount || 0} notes
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckSquare size={12} />
                    {tag.usage?.tasksCount || 0} tasks
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </SectionCard>

      {modalOpen ? (
        <ModalShell
          title={editingTag ? 'Edit tag' : 'Create tag'}
          onClose={() => {
            setModalOpen(false);
            form.reset({ name: '' });
          }}
        >
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <label className="space-y-1 text-sm text-slate-300">
              <span>Tag name</span>
              <input
                {...form.register('name', { required: 'Tag name is required' })}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none"
                placeholder="e.g. Work, Urgent, Research"
              />
              {form.formState.errors.name ? (
                <span className="text-xs text-rose-400">{form.formState.errors.name.message}</span>
              ) : null}
            </label>

            <div className="space-y-2 text-sm text-slate-300">
              <span>Tag color</span>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`h-8 w-8 rounded-full transition transform ${
                      selectedColor === color ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  form.reset({ name: '' });
                }}
                className="rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950"
              >
                {editingTag ? 'Save changes' : 'Create tag'}
              </button>
            </div>
          </form>
        </ModalShell>
      ) : null}
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

function ModalShell({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl shadow-black/40">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          <button onClick={onClose} className="rounded-full border border-white/10 bg-slate-800/70 p-2 text-slate-200">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
