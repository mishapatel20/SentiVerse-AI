import React, { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import {
  FileText, Download, BarChart3, TrendingUp, TrendingDown,
  Minus, ShieldAlert, RefreshCw, CheckCircle, AlertTriangle, Clock
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-2xl font-extrabold text-white tracking-tight">{value}</p>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
    </div>
  </div>
);

const ExportReportPage = () => {
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [reportTitle, setReportTitle] = useState('Sentiment Analysis Report');
  const [success, setSuccess] = useState('');

  const fetchSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await reportAPI.getSummary();
      setSummary(res.data);
    } catch {
      setError('Failed to load analysis summary. Make sure you have submitted predictions first.');
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => { fetchSummary(); }, []);

  const handleGeneratePDF = async () => {
    if (!summary?.can_generate) return;
    setGenerating(true);
    setError('');
    setSuccess('');
    try {
      const res = await reportAPI.generatePDF({ title: reportTitle });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SentiVerse_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess(`Report "${reportTitle}" generated and downloaded successfully!`);
    } catch (err) {
      setError('PDF generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const positivePct = summary ? Math.round((summary.positive / summary.total) * 100) : 0;
  const negativePct = summary ? Math.round((summary.negative / summary.total) * 100) : 0;
  const neutralPct = summary ? Math.round((summary.neutral / summary.total) * 100) : 0;
  const fakePct = summary ? Math.round((summary.fake / summary.total) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Export Report <FileText className="w-5 h-5 text-indigo-400" />
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Generate a comprehensive PDF report of all your sentiment analysis data.
          </p>
        </div>
        <button
          onClick={fetchSummary}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-2 cursor-pointer transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Error / Success Toast */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
          <CheckCircle className="w-4 h-4 shrink-0" /> {success}
        </div>
      )}

      {loadingSummary ? (
        <div className="flex items-center justify-center py-20 text-gray-400 space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading analysis data...</span>
        </div>
      ) : summary ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={BarChart3} label="Total Analyzed" value={summary.total}
              color="bg-indigo-500/15 text-indigo-400" />
            <StatCard icon={TrendingUp} label="Positive" value={`${summary.positive} (${positivePct}%)`}
              color="bg-emerald-500/15 text-emerald-400" />
            <StatCard icon={TrendingDown} label="Negative" value={`${summary.negative} (${negativePct}%)`}
              color="bg-rose-500/15 text-rose-400" />
            <StatCard icon={ShieldAlert} label="Spam / Fake" value={`${summary.fake} (${fakePct}%)`}
              color="bg-amber-500/15 text-amber-400" />
          </div>

          {/* Sentiment Distribution Visual */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
            <h3 className="text-sm font-bold text-white">Sentiment Distribution Preview</h3>

            {[
              { label: 'Positive', pct: positivePct, bar: 'bg-gradient-to-r from-emerald-500 to-teal-400', text: 'text-emerald-400' },
              { label: 'Neutral', pct: neutralPct, bar: 'bg-gradient-to-r from-indigo-500 to-blue-400', text: 'text-indigo-400' },
              { label: 'Negative', pct: negativePct, bar: 'bg-gradient-to-r from-rose-500 to-pink-400', text: 'text-rose-400' },
              { label: 'Fake / Spam', pct: fakePct, bar: 'bg-gradient-to-r from-amber-500 to-orange-400', text: 'text-amber-400' },
            ].map(s => (
              <div key={s.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold ${s.text}`}>{s.label}</span>
                  <span className="text-gray-300 font-mono">{s.pct}%</span>
                </div>
                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.bar} transition-all duration-700`}
                    style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}

            <div className="flex flex-wrap gap-4 pt-3 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Avg. Confidence: <span className="text-white font-bold">{summary.avg_confidence}%</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                Avg. Inference: <span className="text-white font-bold">{summary.avg_inference_ms} ms</span>
              </div>
            </div>
          </div>

          {/* Report Generator */}
          <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-900/20 to-purple-900/10 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-indigo-400" /> Generate PDF Report
            </h3>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Report Title
              </label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="e.g. Q3 2025 E-Commerce Sentiment Analysis"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* What's Included */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                '📄 Executive Summary with KPIs',
                '📊 Sentiment breakdown statistics',
                '🔍 Detailed prediction records (up to 50)',
                '🤖 AI-generated insights & recommendations',
                '🛡️ Spam/Fake review detection results',
                '⏱️ Inference latency performance data',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-gray-300 p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {!summary.can_generate && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                ⚠ No predictions found. Run at least one sentiment analysis before generating a report.
              </div>
            )}

            <button
              onClick={handleGeneratePDF}
              disabled={generating || !summary.can_generate || !reportTitle.trim()}
              className="w-full py-3.5 rounded-xl glow-primary text-white font-bold text-sm hover:scale-[1.01] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
            >
              {generating ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /> Generating PDF...</>
              ) : (
                <><Download className="w-5 h-5" /> Download PDF Report</>
              )}
            </button>
            <p className="text-center text-[10px] text-gray-500">
              The PDF will be automatically downloaded to your browser's default download folder.
            </p>
          </div>
        </>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <FileText className="w-14 h-14 mx-auto mb-4 text-gray-700" />
          <p className="text-sm">Unable to load report data.</p>
          <button onClick={fetchSummary} className="mt-3 text-xs text-indigo-400 hover:underline cursor-pointer">Try Again</button>
        </div>
      )}
    </div>
  );
};

export default ExportReportPage;
