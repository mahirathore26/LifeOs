import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  ExternalLink,
  File,
  FileImage,
  FileText,
  FileVideo,
  Filter,
  FolderKanban,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import SectionCard from '../components/SectionCard';
import { fetchProjects } from '../features/projects/projectsSlice';
import {
  clearDocumentError,
  createDocument,
  deleteDocument,
  fetchDocuments,
  updateDocument,
} from '../features/documents/documentsSlice';

const defaultValues = {
  title: '',
  description: '',
  project: '',
};

function getMimeIcon(mimeType = '') {
  if (mimeType.startsWith('image/')) return FileImage;
  if (mimeType.startsWith('video/')) return FileVideo;
  if (mimeType === 'application/pdf' || mimeType.includes('text')) return FileText;
  return File;
}

function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const dispatch = useDispatch();
  const { items, loading, uploading, error, pagination } = useSelector((state) => state.documents);
  const { items: projects } = useSelector((state) => state.projects);

  const [query, setQuery] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState('create');

  const fileRef = useRef(null);
  const form = useForm({ defaultValues });

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = { page, limit, search: query };
      if (filterProject) params.project = filterProject;
      dispatch(fetchDocuments(params));
    }, 220);
    return () => clearTimeout(timeout);
  }, [dispatch, page, limit, query, filterProject]);

  useEffect(() => {
    if (!selectedDocId && items.length) {
      setSelectedDocId(items[0]._id);
    }
  }, [items, selectedDocId]);

  const selectedDoc = useMemo(() => items.find((d) => d._id === selectedDocId) || null, [items, selectedDocId]);

  const stats = useMemo(() => {
    const images = items.filter((d) => d.file?.mimeType?.startsWith('image/')).length;
    const pdfs = items.filter((d) => d.file?.mimeType === 'application/pdf').length;
    const totalSize = items.reduce((acc, d) => acc + (d.file?.bytes || 0), 0);
    return { total: items.length, images, pdfs, totalSize };
  }, [items]);

  const refreshDocuments = () => {
    const params = { page, limit, search: query };
    if (filterProject) params.project = filterProject;
    dispatch(fetchDocuments(params));
  };

  const openModal = (doc = null) => {
    setMode(doc ? 'edit' : 'create');
    setSelectedDocId(doc?._id || selectedDocId);
    form.reset(
      doc
        ? {
            title: doc.title || '',
            description: doc.description || '',
            project: doc.project || '',
          }
        : defaultValues
    );
    if (fileRef.current) fileRef.current.value = '';
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    const file = fileRef.current?.files?.[0];

    if (mode === 'create' && !file) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('title', values.title.trim());
    if (values.description) formData.append('description', values.description.trim());
    if (values.project) formData.append('project', values.project);
    if (file) formData.append('file', file);

    try {
      if (mode === 'edit' && selectedDoc) {
        await dispatch(updateDocument({ id: selectedDoc._id, formData })).unwrap();
        toast.success('Document updated');
      } else {
        await dispatch(createDocument(formData)).unwrap();
        toast.success('Document uploaded');
      }
      setModalOpen(false);
      form.reset(defaultValues);
      if (fileRef.current) fileRef.current.value = '';
      setPage(1);
      await dispatch(fetchDocuments({ page: 1, limit, search: query }));
    } catch (err) {
      toast.error(err || 'Document action failed');
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete "${doc.title}"? This will permanently remove the file.`)) return;
    try {
      await dispatch(deleteDocument(doc._id)).unwrap();
      if (selectedDocId === doc._id) setSelectedDocId(null);
      toast.success('Document deleted');
      await refreshDocuments();
    } catch (err) {
      toast.error(err || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-4xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Documents</p>
            <h2 className="mt-2 text-3xl font-semibold">Store and access your files.</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-400">
              Upload, preview, and manage all your project documents in one organized workspace.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => { dispatch(clearDocumentError()); refreshDocuments(); }}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-4 py-2 text-sm text-slate-200"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              <Upload size={16} />
              Upload
            </button>
          </div>
        </div>
      </motion.section>

      {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Documents" value={stats.total} icon={File} tone="from-sky-500/20 to-sky-400/10" />
        <MetricCard label="Images" value={stats.images} icon={FileImage} tone="from-violet-500/20 to-violet-400/10" />
        <MetricCard label="PDFs" value={stats.pdfs} icon={FileText} tone="from-emerald-500/20 to-emerald-400/10" />
        <MetricCard label="Total size" value={formatBytes(stats.totalSize)} icon={Upload} tone="from-amber-500/20 to-amber-400/10" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          title="Document library"
          subtitle="Search and filter your uploaded files"
          action={
            <button onClick={() => openModal()} className="rounded-full border border-white/10 bg-slate-800/70 p-2 text-slate-200">
              <Plus size={16} />
            </button>
          }
        >
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-300">
              <Search size={16} />
              <input
                value={query}
                onChange={(e) => { setPage(1); setQuery(e.target.value); }}
                className="w-full bg-transparent outline-none"
                placeholder="Search documents"
              />
            </label>
            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-300">
              <FolderKanban size={14} />
              <select
                value={filterProject}
                onChange={(e) => { setPage(1); setFilterProject(e.target.value); }}
                className="bg-transparent outline-none"
              >
                <option value="">All projects</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.name || p._id}</option>
                ))}
              </select>
            </label>
          </div>

          {loading ? (
            <SkeletonLines count={4} />
          ) : items.length === 0 ? (
            <EmptyState message="No documents found. Upload your first file." />
          ) : (
            <div className="space-y-3">
              {items.map((doc) => {
                const Icon = getMimeIcon(doc.file?.mimeType);
                const isSelected = doc._id === selectedDocId;
                return (
                  <motion.article
                    key={doc._id}
                    layout
                    onClick={() => setSelectedDocId(doc._id)}
                    className={`cursor-pointer rounded-3xl border p-4 transition ${
                      isSelected
                        ? 'border-sky-400/30 bg-sky-500/10'
                        : 'border-white/10 bg-slate-800/70 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-2 text-sky-300">
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate font-semibold text-slate-100">{doc.title}</h4>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {doc.file?.originalName} &middot; {formatBytes(doc.file?.bytes)}
                          </p>
                          {doc.description ? (
                            <p className="mt-1 line-clamp-1 text-sm text-slate-400">{doc.description}</p>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <a
                          href={doc.file?.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-xl border border-white/10 bg-slate-900/70 p-2 text-slate-200"
                          title="Open file"
                        >
                          <ExternalLink size={14} />
                        </a>
                        <button
                          onClick={(e) => { e.stopPropagation(); openModal(doc); }}
                          className="rounded-xl border border-white/10 bg-slate-900/70 p-2 text-slate-200"
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(doc); }}
                          className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-2 text-rose-300"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                      <span className="rounded-full border border-white/10 bg-slate-900/70 px-2.5 py-1 uppercase tracking-wider">
                        {doc.file?.format || doc.file?.extension || 'file'}
                      </span>
                      <span className="rounded-full border border-white/10 bg-slate-900/70 px-2.5 py-1">
                        {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}
                      </span>
                      {doc.project ? (
                        <span className="rounded-full border border-white/10 bg-slate-900/70 px-2.5 py-1">
                          {projects.find((p) => p._id === doc.project)?.name || 'Project'}
                        </span>
                      ) : null}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}

          <div className="mt-5 flex items-center justify-between">
            <div className="text-sm text-slate-400">
              Page {pagination?.page || 1} of {pagination?.totalPages || 1}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={!pagination?.hasPreviousPage}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-2xl border border-white/10 bg-slate-800/70 p-2 text-slate-300 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={!pagination?.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-2xl border border-white/10 bg-slate-800/70 p-2 text-slate-300 disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Document preview" subtitle="File details and quick actions">
            {selectedDoc ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-sky-300">
                        {(() => {
                          const Icon = getMimeIcon(selectedDoc.file?.mimeType);
                          return <Icon size={22} />;
                        })()}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-slate-100">{selectedDoc.title}</h4>
                        <p className="mt-0.5 text-sm text-slate-400">{selectedDoc.file?.originalName}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => openModal(selectedDoc)}
                      className="rounded-full border border-white/10 bg-slate-900/70 p-2 text-slate-200"
                    >
                      <Edit3 size={15} />
                    </button>
                  </div>
                  {selectedDoc.description ? (
                    <p className="mt-3 text-sm text-slate-400">{selectedDoc.description}</p>
                  ) : null}
                  {selectedDoc.file?.mimeType?.startsWith('image/') ? (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
                      <img
                        src={selectedDoc.file.url}
                        alt={selectedDoc.title}
                        className="max-h-48 w-full object-cover"
                      />
                    </div>
                  ) : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoChip label="File size" value={formatBytes(selectedDoc.file?.bytes)} />
                  <InfoChip label="Format" value={(selectedDoc.file?.format || selectedDoc.file?.extension || 'Unknown').toUpperCase()} />
                  <InfoChip label="Type" value={selectedDoc.file?.mimeType || '—'} />
                  <InfoChip label="Uploaded" value={selectedDoc.createdAt ? new Date(selectedDoc.createdAt).toLocaleDateString() : '—'} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={selectedDoc.file?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200"
                  >
                    <ExternalLink size={14} />
                    Open
                  </a>
                  <a
                    href={selectedDoc.file?.url}
                    download={selectedDoc.file?.originalName}
                    className="inline-flex items-center gap-2 rounded-2xl border border-sky-400/20 bg-sky-500/10 px-3 py-2 text-sm text-sky-300"
                  >
                    <Download size={14} />
                    Download
                  </a>
                  <button
                    onClick={() => handleDelete(selectedDoc)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <EmptyState message="Select a document to preview it." />
            )}
          </SectionCard>

          <SectionCard title="Quick upload" subtitle="Upload new files directly">
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950"
            >
              <Upload size={16} />
              Upload document
            </button>
          </SectionCard>
        </div>
      </div>

      {modalOpen ? (
        <ModalShell
          title={mode === 'edit' ? 'Edit document' : 'Upload document'}
          onClose={() => { setModalOpen(false); form.reset(defaultValues); }}
        >
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <label className="space-y-1 text-sm text-slate-300">
              <span>Title</span>
              <input
                {...form.register('title', { required: 'Title is required' })}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none"
                placeholder="Document title"
              />
              {form.formState.errors.title ? (
                <span className="text-xs text-rose-400">{form.formState.errors.title.message}</span>
              ) : null}
            </label>

            <label className="space-y-1 text-sm text-slate-300">
              <span>Description</span>
              <textarea
                {...form.register('description')}
                rows={3}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none"
                placeholder="Optional description"
              />
            </label>

            <label className="space-y-1 text-sm text-slate-300">
              <span>Project</span>
              <select
                {...form.register('project')}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none"
              >
                <option value="">No project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.name || p._id}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm text-slate-300">
              <span>{mode === 'edit' ? 'Replace file (optional)' : 'File'}</span>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2">
                <Upload size={16} className="shrink-0 text-slate-400" />
                <input
                  ref={fileRef}
                  type="file"
                  className="w-full bg-transparent text-sm text-slate-300 outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-slate-700 file:px-3 file:py-1 file:text-xs file:text-slate-200"
                />
              </div>
            </label>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setModalOpen(false); form.reset(defaultValues); }}
                className="rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
              >
                {uploading ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploading ? 'Uploading…' : mode === 'edit' ? 'Save' : 'Upload'}
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

function InfoChip({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-3 text-sm text-slate-300">
      <p className="text-slate-400">{label}</p>
      <p className="mt-1 truncate font-medium text-slate-100">{value}</p>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-4 text-sm text-slate-400">
      {message}
    </div>
  );
}

function SkeletonLines({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-2xl border border-white/10 bg-slate-800/70" />
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
          <button onClick={onClose} className="rounded-full border border-white/10 bg-slate-800/70 p-2 text-slate-200">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
