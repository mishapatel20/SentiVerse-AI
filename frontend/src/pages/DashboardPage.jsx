import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import StatCard from '../components/StatCard';
import SentimentBadge from '../components/SentimentBadge';
import SkeletonLoader from '../components/SkeletonLoader';
import { 
  MessageSquare, ThumbsUp, ThumbsDown, Minus, Shield, 
  ArrowRight, Sparkles, PlusCircle, FileSpreadsheet, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line 
} from 'recharts';

const DashboardPage = () => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await dashboardAPI.getStats();
      setStatsData(res.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading || !statsData) {
    return <SkeletonLoader type="card" />;
  }

  const { stats, recent_predictions, monthly_trend } = statsData;

  const pieData = [
    { name: 'Positive', value: stats.positive_reviews || 65, color: '#10b981' },
    { name: 'Negative', value: stats.negative_reviews || 25, color: '#f43f5e' },
    { name: 'Neutral', value: stats.neutral_reviews || 10, color: '#f59e0b' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10 glow-primary bg-opacity-20">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Welcome to SentiVerse Dashboard <Sparkles className="w-5 h-5 text-indigo-300" />
          </h1>
          <p className="text-xs text-gray-300 mt-1">Real-time e-commerce review analytics & AI sentiment monitoring.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/analyze/single"
            className="px-4 py-2.5 rounded-xl bg-white text-slate-950 font-bold text-xs shadow-lg hover:bg-gray-100 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-indigo-600" /> Single Review
          </Link>
          <Link
            to="/analyze/bulk"
            className="px-4 py-2.5 rounded-xl glass-panel border border-white/20 text-white font-semibold text-xs hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-400" /> Bulk CSV Analysis
          </Link>
        </div>
      </div>

      {/* Top 5 Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Reviews" value={stats.total_reviews} icon={MessageSquare} color="indigo" change="+14.2%" isIncrease={true} />
        <StatCard title="Positive Sentiment" value={stats.positive_reviews} icon={ThumbsUp} color="emerald" change="+8.5%" isIncrease={true} />
        <StatCard title="Negative Sentiment" value={stats.negative_reviews} icon={ThumbsDown} color="rose" change="-3.1%" isIncrease={false} />
        <StatCard title="Neutral Sentiment" value={stats.neutral_reviews} icon={Minus} color="amber" change="0.0%" isIncrease={true} />
        <StatCard title="Avg Confidence" value={`${stats.average_confidence}%`} icon={Shield} color="purple" change="+2.4%" isIncrease={true} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart: Sentiment Distribution */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10">
          <h3 className="text-sm font-bold text-white mb-4">Sentiment Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-xs mt-2">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Positive</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500"></span> Negative</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Neutral</div>
          </div>
        </div>

        {/* Bar Chart: Monthly Sentiment Trends */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 lg:col-span-2">
          <h3 className="text-sm font-bold text-white mb-4">Monthly Sentiment Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="positive" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="negative" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="neutral" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Predictions Table */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Predictions</h3>
            <p className="text-xs text-gray-400">Latest analyzed product reviews</p>
          </div>
          <Link to="/history" className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
            View All History <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="border-b border-white/10 uppercase tracking-wider text-[10px] text-gray-400 font-semibold">
              <tr>
                <th className="py-3 px-4">Review Text</th>
                <th className="py-3 px-4">Predicted Sentiment</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recent_predictions.length > 0 ? (
                recent_predictions.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-medium text-white max-w-md truncate">{item.review_text}</td>
                    <td className="py-3 px-4">
                      <SentimentBadge sentiment={item.sentiment} showConfidence={false} />
                    </td>
                    <td className="py-3 px-4 font-semibold text-indigo-300">{item.confidence}%</td>
                    <td className="py-3 px-4 text-gray-400">{new Date(item.created_at).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">No predictions recorded yet. Run your first analysis!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
