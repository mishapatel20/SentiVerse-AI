import React, { useState } from 'react';
import { predictAPI } from '../services/api';
import SentimentBadge from '../components/SentimentBadge';
import { 
  Sparkles, Zap, Cpu, ShieldAlert, Globe, Layers, 
  MessageSquare, RefreshCw, CheckCircle2, ArrowRight, CornerDownRight
} from 'lucide-react';

const SingleAnalysisPage = () => {
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const sampleReviews = [
    { label: 'Positive Phone Review', text: "The battery life on this flagship smartphone is incredible! Lasts 2 full days on heavy usage, and 65W charging is ultra fast. Camera photos in night mode look stunning." },
    { label: 'Negative Laptop Review', text: "Battery drains rapidly in less than 2 hours! Overheats terribly during basic video calls and the screen has severe light bleed. Extremely disappointed, waste of money!" },
    { label: 'Neutral Appliance Review', text: "The microwave works okay for basic heating. Design is average 1080p panel, build quality feels standard. Shipping arrived on day 5 as expected." },
    { label: 'Fake Bot Review', text: "BEST PRODUCT EVER DON'T THINK JUST BUY BUY BUY 100% LEGIT FREE GIFT WHATSAPP ME FOR DISCOUNT!!!" },
    { label: 'Spanish Review', text: "Excelente calidad de pantalla y cámara trasera. La batería dura todo el día sin problemas. Muy satisfecho con el servicio de entrega." }
  ];

  const handleAnalyze = async () => {
    if (!reviewText.trim()) {
      setError('Please paste or type a review before running analysis.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await predictAPI.analyzeSingle(reviewText);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in max-w-6xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          Single Review Analysis Engine <Sparkles className="w-5 h-5 text-indigo-400" />
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Deep NLP diagnostics with aspect-based sentiment, emotion spectrum, language detection, and spam screening.
        </p>
      </div>

      {/* Sample Quick Loaders */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-2">Quick Samples:</span>
        {sampleReviews.map((sample, idx) => (
          <button
            key={idx}
            onClick={() => {
              setReviewText(sample.text);
              setResult(null);
            }}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-300 hover:text-white transition-all cursor-pointer"
          >
            {sample.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Product Review Text</label>
          <div className="text-[11px] text-gray-400">
            {reviewText.length} characters | {reviewText.split(/\s+/).filter(Boolean).length} words
          </div>
        </div>

        <textarea
          rows={5}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Paste or type any e-commerce product review here (e.g. 'The battery life is super impressive but camera is blurry in low light...')"
          className="w-full p-4 rounded-2xl bg-slate-900/90 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 transition-all"
        ></textarea>

        {error && <div className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{error}</div>}

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => {
              setReviewText('');
              setResult(null);
            }}
            className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white transition-colors"
          >
            Clear Text
          </button>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-8 py-3 rounded-xl glow-primary text-white font-bold text-xs shadow-lg shadow-indigo-500/25 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {loading ? 'Processing NLP Pipeline...' : 'Run AI Analysis'}
          </button>
        </div>
      </div>

      {/* Detailed Analysis Output */}
      {result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          {/* Top Result Banner */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-indigo-900/30 to-purple-900/30">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">Primary Sentiment Result</span>
              <div className="flex items-center gap-4">
                <SentimentBadge sentiment={result.sentiment} confidence={result.confidence} />
                <span className="text-xs text-gray-400 font-mono">Latency: {result.inference_time_ms} ms</span>
              </div>
            </div>

            {/* Probability Breakdown */}
            <div className="w-full md:w-80 space-y-2">
              <div className="text-[11px] font-semibold text-gray-300 flex justify-between">
                <span>Positive</span> <span>{result.probability.positive}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${result.probability.positive}%` }}></div>
              </div>

              <div className="text-[11px] font-semibold text-gray-300 flex justify-between">
                <span>Negative</span> <span>{result.probability.negative}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: `${result.probability.negative}%` }}></div>
              </div>

              <div className="text-[11px] font-semibold text-gray-300 flex justify-between">
                <span>Neutral</span> <span>{result.probability.neutral}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${result.probability.neutral}%` }}></div>
              </div>
            </div>
          </div>

          {/* Grid: Aspect Sentiment & Emotions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Aspect Sentiment Breakdown */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" /> Aspect-Based Sentiment Breakdown
              </h3>
              <div className="space-y-3">
                {Object.entries(result.aspects).map(([aspectName, info]) => (
                  <div key={aspectName} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white block">{aspectName}</span>
                      {info.snippet && <span className="text-[10px] text-gray-400 italic font-mono block mt-0.5">"{info.snippet}"</span>}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      info.sentiment === 'Positive' ? 'bg-emerald-500/20 text-emerald-300' :
                      info.sentiment === 'Negative' ? 'bg-rose-500/20 text-rose-300' :
                      info.sentiment === 'Neutral' ? 'bg-amber-500/20 text-amber-300' : 'bg-gray-800 text-gray-500'
                    }`}>
                      {info.sentiment}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Emotions & Fake Review Detector */}
            <div className="space-y-6">
              {/* Emotion Spectrum */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" /> Detected Customer Emotions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(result.emotions.breakdown).map(([emotion, val]) => (
                    <div key={emotion} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex-1 min-w-[100px] text-center">
                      <span className="text-[10px] text-gray-400 block font-semibold">{emotion}</span>
                      <span className="text-xs font-bold text-white mt-1 block">{Math.round(val * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fake Review Detector Card */}
              <div className={`glass-panel p-6 rounded-3xl border ${result.fake_detection.is_fake ? 'border-rose-500/40 bg-rose-950/20' : 'border-emerald-500/30 bg-emerald-950/20'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldAlert className={`w-4 h-4 ${result.fake_detection.is_fake ? 'text-rose-400' : 'text-emerald-400'}`} />
                    Fake Review & Spam Classifier
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${result.fake_detection.is_fake ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                    Risk: {result.fake_detection.score}
                  </span>
                </div>
                <div className="mt-3 space-y-1">
                  {result.fake_detection.reasons.map((r, i) => (
                    <div key={i} className="text-xs text-gray-300 flex items-center gap-1.5">
                      <CornerDownRight className="w-3 h-3 text-indigo-400" /> {r}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" /> Actionable Product Improvement Suggestions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.recommendations.map((rec, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-indigo-200 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleAnalysisPage;
