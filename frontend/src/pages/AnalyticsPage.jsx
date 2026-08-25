import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';
import { BarChart3, ShieldCheck, Cpu, Sparkles, PieChart as PieIcon } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await dashboardAPI.getAnalytics();
        setData(res.data);
      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return <SkeletonLoader type="card" />;
  }

  const pieData = [
    { name: 'Positive', value: data.sentiment_distribution.positive, color: '#10b981' },
    { name: 'Negative', value: data.sentiment_distribution.negative, color: '#f43f5e' },
    { name: 'Neutral', value: data.sentiment_distribution.neutral, color: '#f59e0b' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            AI Analytics & Model Metrics <BarChart3 className="w-5 h-5 text-indigo-400" />
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Deep statistical telemetry, aspect distribution heatmaps, and keyword frequency.
          </p>
        </div>

        {/* Model Accuracy Card */}
        <div className="glass-panel px-4 py-2 rounded-2xl border border-indigo-500/30 flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <div>
            <span className="text-[10px] uppercase text-gray-400 font-bold block">Model Accuracy</span>
            <span className="text-base font-extrabold text-white">{data.model_accuracy}%</span>
          </div>
        </div>
      </div>

      {/* Grid: Sentiment & Confidence Histograms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sentiment Distribution */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-indigo-400" /> Sentiment Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                  {pieData.map((e, idx) => <Cell key={idx} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confidence Distribution */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" /> Confidence Score Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.confidence_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid: Positive & Negative Word Cloud Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Positive Keywords */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" /> High-Frequency Positive Keywords
          </h3>
          <div className="flex flex-wrap gap-2.5 pt-2">
            {data.top_positive_words.map((item, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5"
              >
                {item.word}
                <span className="text-[10px] text-emerald-400/60 font-mono">({item.count})</span>
              </span>
            ))}
          </div>
        </div>

        {/* Top Negative Keywords */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-400" /> High-Frequency Negative Keywords
          </h3>
          <div className="flex flex-wrap gap-2.5 pt-2">
            {data.top_negative_words.map((item, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5"
              >
                {item.word}
                <span className="text-[10px] text-rose-400/60 font-mono">({item.count})</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
