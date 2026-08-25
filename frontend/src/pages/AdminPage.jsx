import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';
import { 
  Shield, Users, FileSpreadsheet, Activity, Trash2, 
  CheckCircle2, AlertTriangle, Cpu, Clock 
} from 'lucide-react';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [uRes, fRes, sRes, lRes] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getUploads(),
        adminAPI.getStats(),
        adminAPI.getLogs()
      ]);
      setUsers(uRes.data.users);
      setUploads(fRes.data.uploads);
      setStats(sRes.data.stats);
      setLogs(lRes.data.logs);
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm(`Are you sure you want to delete user ${email}?`)) return;
    try {
      await adminAPI.deleteUser(userId);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user.');
    }
  };

  if (loading || !stats) {
    return <SkeletonLoader type="table" />;
  }

  return (
    <div className="space-y-8 animate-in fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          Administrator Control Panel <Shield className="w-5 h-5 text-purple-400" />
        </h1>
        <p className="text-xs text-gray-400 mt-1">System-wide user management, dataset registry, and API telemetry.</p>
      </div>

      {/* Top 4 Admin Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-purple-500/20 bg-purple-950/10">
          <span className="text-[10px] font-bold uppercase text-gray-400 block">Total Registered Users</span>
          <div className="text-2xl font-extrabold text-white mt-2">{stats.total_users}</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20 bg-indigo-950/10">
          <span className="text-[10px] font-bold uppercase text-gray-400 block">Total System Predictions</span>
          <div className="text-2xl font-extrabold text-white mt-2">{stats.total_predictions}</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/10">
          <span className="text-[10px] font-bold uppercase text-gray-400 block">Uploaded CSV Datasets</span>
          <div className="text-2xl font-extrabold text-white mt-2">{stats.total_files_uploaded}</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 bg-amber-950/10">
          <span className="text-[10px] font-bold uppercase text-gray-400 block">Avg System Latency</span>
          <div className="text-2xl font-extrabold text-white mt-2">{stats.average_inference_time_ms} ms</div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          User Registry ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('uploads')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'uploads' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          CSV Dataset Log ({uploads.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'logs' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          Audit Logs ({logs.length})
        </button>
      </div>

      {/* Tab 1: User Management */}
      {activeTab === 'users' && (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="border-b border-white/10 uppercase tracking-wider text-[10px] text-gray-400 font-semibold">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Predictions</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{u.full_name}</div>
                      <div className="text-[11px] text-gray-400">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-white/10 text-gray-300'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-indigo-300">{u.prediction_count}</td>
                    <td className="py-3 px-4 text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Uploaded Datasets */}
      {activeTab === 'uploads' && (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="border-b border-white/10 uppercase tracking-wider text-[10px] text-gray-400 font-semibold">
                <tr>
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">Uploader</th>
                  <th className="py-3 px-4">Rows</th>
                  <th className="py-3 px-4">Pos / Neg / Neu</th>
                  <th className="py-3 px-4">Uploaded At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {uploads.map((file) => (
                  <tr key={file.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{file.filename}</td>
                    <td className="py-3 px-4 text-indigo-300">{file.uploader_email}</td>
                    <td className="py-3 px-4 font-mono">{file.row_count}</td>
                    <td className="py-3 px-4 text-[11px]">
                      <span className="text-emerald-400">{file.positive_count}</span> / <span className="text-rose-400">{file.negative_count}</span> / <span className="text-amber-400">{file.neutral_count}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{new Date(file.uploaded_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: System Audit Logs */}
      {activeTab === 'logs' && (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 overflow-hidden">
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mr-2">
                    {log.action}
                  </span>
                  <span className="text-gray-300">{log.details}</span>
                  <span className="text-gray-500 text-[10px] ml-2 font-mono">({log.user_email || 'System'})</span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
