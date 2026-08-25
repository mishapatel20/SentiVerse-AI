import React, { useState, useEffect } from 'react';
import { historyAPI } from '../services/api';
import SentimentBadge from '../components/SentimentBadge';
import SkeletonLoader from '../components/SkeletonLoader';
import { 
  History, Search, Trash2, Download, Eye, X, 
  ChevronLeft, ChevronRight, Filter, AlertCircle 
} from 'lucide-react';

const HistoryPage = () => {
  const [predictions, setPredictions] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchHistory = async (page = 1) => {
    setLoading(true);
    try {
      const res = await historyAPI.getHistory({
        page,
        limit: 10,
        search,
        sentiment: sentimentFilter
      });
      setPredictions(res.data.predictions);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, [sentimentFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory(1);
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this prediction record?")) return;
    try {
      await historyAPI.deletePrediction(id);
      fetchHistory(pagination.page);
    } catch (err) {
      alert("Delete failed.");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("WARNING: This will permanently delete ALL prediction history! Proceed?")) return;
    try {
      await historyAPI.clearHistory();
      fetchHistory(1);
    } catch (err) {
      alert("Clear history failed.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Prediction History Database <History className="w-5 h-5 text-indigo-400" />
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Search, filter, inspect, and manage all your historical review predictions.
          </p>
        </div>

        {predictions.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-semibold text-rose-300 transition-all flex items-center gap-2 cursor-pointer w-fit"
          >
            <Trash2 className="w-4 h-4" /> Clear All History
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-96">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in review text..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button type="submit" className="px-4 py-2 rounded-xl glow-primary text-white text-xs font-semibold">
            Search
          </button>
        </form>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">Filter:</span>
          {['', 'positive', 'negative', 'neutral'].map((s) => (
            <button
              key={s}
              onClick={() => setSentimentFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                sentimentFilter === s ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* History Data Table */}
      {loading ? (
        <SkeletonLoader type="table" />
      ) : (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 overflow-hidden space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="border-b border-white/10 uppercase tracking-wider text-[10px] text-gray-400 font-semibold">
                <tr>
                  <th className="py-3 px-4">Review Content</th>
                  <th className="py-3 px-4">Sentiment</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Spam Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {predictions.length > 0 ? (
                  predictions.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-medium text-white max-w-sm truncate">{p.review_text}</td>
                      <td className="py-3 px-4">
                        <SentimentBadge sentiment={p.sentiment} showConfidence={false} />
                      </td>
                      <td className="py-3 px-4 font-semibold text-indigo-300">{p.confidence}%</td>
                      <td className="py-3 px-4">
                        {p.is_fake ? (
                          <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded">Spam</span>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-medium">Clean</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-400">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedItem(p)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-indigo-300 transition-colors"
                          title="View Full Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(p.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">No matching predictions found in database.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-gray-400">
              <span>Showing Page {pagination.page} of {pagination.total_pages} ({pagination.total} total)</span>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchHistory(pagination.page - 1)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button
                  disabled={pagination.page >= pagination.total_pages}
                  onClick={() => fetchHistory(pagination.page + 1)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Detail Viewer */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Prediction Details #{selectedItem.id}</h3>
              <button onClick={() => setSelectedItem(null)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Raw Review Text</span>
                <p className="p-3 rounded-xl bg-slate-900 text-gray-200 mt-1 font-mono">{selectedItem.review_text}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Sentiment & Score</span>
                  <div className="mt-1 flex items-center gap-2">
                    <SentimentBadge sentiment={selectedItem.sentiment} confidence={selectedItem.confidence} />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Inference Latency</span>
                  <span className="text-xs font-bold text-indigo-300 mt-1 inline-block">{selectedItem.inference_time_ms} ms</span>
                </div>
              </div>

              {selectedItem.recommendation && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-400 block">AI Product Advice</span>
                  <p className="p-3 rounded-xl bg-indigo-950/40 text-indigo-200 border border-indigo-500/20 mt-1">{selectedItem.recommendation}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
