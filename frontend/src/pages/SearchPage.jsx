import { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import api from '../lib/api';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await api.get('/search', { params: { query } });
      setResults(response?.data?.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Search</p>
        <h2 className="mt-2 text-2xl font-semibold">Find anything across your workspace</h2>
        <form onSubmit={handleSearch} className="mt-4 flex gap-3">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks, notes, projects, and learning" className="flex-1 rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm outline-none" />
          <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-sm font-medium text-white">
            <SearchIcon size={16} />
            Search
          </button>
        </form>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
        {loading ? <p className="text-sm text-slate-400">Searching…</p> : results ? (
          <pre className="overflow-x-auto text-sm text-slate-400">{JSON.stringify(results, null, 2)}</pre>
        ) : <p className="text-sm text-slate-400">Start a search to explore your workspace.</p>}
      </div>
    </div>
  );
}
