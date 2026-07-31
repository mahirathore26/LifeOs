import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Clock,
  ExternalLink,
  File,
  FileSearch,
  FolderKanban,
  Search as SearchIcon,
  StickyNote,
  X,
} from 'lucide-react';
import api from '../lib/api';

const TYPE_FILTERS = [
  { value: '', label: 'All' },
  { value: 'note', label: 'Notes', icon: StickyNote, color: 'text-emerald-300' },
  { value: 'task', label: 'Tasks', icon: CheckSquare, color: 'text-violet-300' },
  { value: 'project', label: 'Projects', icon: FolderKanban, color: 'text-sky-300' },
  { value: 'document', label: 'Documents', icon: File, color: 'text-amber-300' },
];

const TYPE_META = {
  note: { icon: StickyNote, badge: 'Note', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/20' },
  task: { icon: CheckSquare, badge: 'Task', color: 'bg-violet-500/10 text-violet-300 border-violet-400/20' },
  project: { icon: FolderKanban, badge: 'Project', color: 'bg-sky-500/10 text-sky-300 border-sky-400/20' },
  document: { icon: File, badge: 'File', color: 'bg-amber-500/10 text-amber-300 border-amber-400/20' },
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState('');
  const [results, setResults] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);

  const runSearch = useCallback(async (q, type, pg = 1) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const params = { q, page: pg, limit: 12 };
      if (type) params.types = [type];
      const response = await api.get('/search', { params });
      setResults(response?.data?.data ?? []);
      setPagination(response?.data?.pagination ?? null);
      setSearched(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    runSearch(query, activeType, 1);
  };

  const handleTypeChange = (type) => {
    setActiveType(type);
    setPage(1);
    if (searched) runSearch(query, type, 1);
  };

  const handleClear = () => {
    setQuery('');
    setResults(null);
    setSearched(false);
    setPage(1);
    setPagination(null);
  };

  const handlePageChange = (next) => {
    setPage(next);
    runSearch(query, activeType, next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const grouped = results
    ? results.reduce((acc, item) => {
        if (!acc[item.type]) acc[item.type] = [];
        acc[item.type].push(item);
        return acc;
      }, {})
    : {};

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-4xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20"
      >
        <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Search</p>
        <h2 className="mt-2 text-3xl font-semibold">Find anything across your workspace.</h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-400">
          Search across notes, tasks, projects, and documents in one place.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="relative flex items-center gap-3">
            <label className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-slate-800/70 px-4 py-3">
              <SearchIcon size={18} className="shrink-0 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks, notes, projects, documents…"
                autoFocus
                className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
              />
              {query ? (
                <button type="button" onClick={handleClear} className="shrink-0 text-slate-400 hover:text-slate-200">
                  <X size={16} />
                </button>
              ) : null}
            </label>
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="inline-flex items-center gap-2 rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50"
            >
              <SearchIcon size={16} />
              Search
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {TYPE_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => handleTypeChange(filter.value)}
                className={`rounded-2xl border px-3 py-1.5 text-sm transition ${
                  activeType === filter.value
                    ? 'border-violet-400/30 bg-violet-500/10 text-violet-300'
                    : 'border-white/10 bg-slate-800/70 text-slate-300 hover:border-white/20'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </form>
      </motion.section>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl border border-white/10 bg-slate-900/70" />
            ))}
          </motion.div>
        ) : !searched ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-slate-900/40 py-20"
          >
            <FileSearch size={40} className="mb-4 text-slate-600" />
            <p className="text-slate-400">Enter a search query and press Search.</p>
          </motion.div>
        ) : results?.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-slate-900/40 py-20"
          >
            <SearchIcon size={40} className="mb-4 text-slate-600" />
            <p className="text-slate-200 font-medium">No results found</p>
            <p className="mt-1 text-sm text-slate-400">Try a different search term or filter.</p>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">
                {pagination?.totalDocuments ?? results.length} result{(pagination?.totalDocuments ?? results.length) !== 1 ? 's' : ''} for{' '}
                <span className="text-slate-200">"{query}"</span>
              </p>
              {pagination && (
                <p className="text-sm text-slate-400">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
              )}
            </div>

            {activeType ? (
              <ResultList items={results} />
            ) : (
              Object.entries(grouped).map(([type, items]) => (
                <section key={type}>
                  <GroupHeader type={type} count={items.length} />
                  <ResultList items={items} />
                </section>
              ))
            )}

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3">
                <button
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => handlePageChange(page - 1)}
                  className="rounded-2xl border border-white/10 bg-slate-800/70 px-4 py-2 text-sm text-slate-300 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-400">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  disabled={!pagination.hasNextPage}
                  onClick={() => handlePageChange(page + 1)}
                  className="rounded-2xl border border-white/10 bg-slate-800/70 px-4 py-2 text-sm text-slate-300 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GroupHeader({ type, count }) {
  const meta = TYPE_META[type] || { badge: type, color: 'bg-slate-500/10 text-slate-300 border-slate-400/20' };
  const Icon = meta.icon || File;
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon size={16} className={meta.color.includes('emerald') ? 'text-emerald-400' : meta.color.includes('violet') ? 'text-violet-400' : meta.color.includes('sky') ? 'text-sky-400' : 'text-amber-400'} />
      <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-300">{meta.badge}s</h3>
      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">{count}</span>
    </div>
  );
}

function ResultList({ items }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <ResultCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function ResultCard({ item }) {
  const meta = TYPE_META[item.type] || { badge: item.type, color: 'bg-slate-500/10 text-slate-300 border-slate-400/20' };
  const Icon = meta.icon || File;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 transition hover:border-white/20"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 rounded-xl border p-2 ${meta.color}`}>
            <Icon size={14} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="truncate font-medium text-slate-100">{item.title}</h4>
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${meta.color}`}>
                {meta.badge}
              </span>
            </div>
            {item.subtitle ? (
              <p className="mt-1 line-clamp-2 text-sm text-slate-400">{item.subtitle}</p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              {item.metadata?.status && (
                <span className="capitalize">{item.metadata.status.replace('_', ' ')}</span>
              )}
              {item.metadata?.priority && (
                <span className="capitalize">{item.metadata.priority} priority</span>
              )}
              {item.metadata?.dueDate && (
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {new Date(item.metadata.dueDate).toLocaleDateString()}
                </span>
              )}
              {item.metadata?.isArchived && <span className="text-amber-400">Archived</span>}
              {item.metadata?.isPinned && <span className="text-violet-400">Pinned</span>}
              {item.metadata?.fileName && <span>{item.metadata.fileName}</span>}
              <span>{new Date(item.updatedAt || item.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        {item.metadata?.url && (
          <a
            href={item.metadata.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-xl border border-white/10 bg-slate-800/70 p-2 text-slate-300 hover:text-slate-100"
          >
            <ExternalLink size={13} />
          </a>
        )}
      </div>
    </motion.div>
  );
}
