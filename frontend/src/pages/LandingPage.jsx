import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, ShieldCheck, Cpu, Zap, 
  BarChart3, Layers, CheckCircle2, MessageSquare, Star, Globe, RefreshCw
} from 'lucide-react';
import SentimentBadge from '../components/SentimentBadge';

const LandingPage = () => {
  const [sampleText, setSampleText] = useState(
    "The battery life on this flagship smartphone is incredible! Lasts 2 full days and charging is ultra fast. Camera photos in night mode look stunning."
  );
  const [demoResult, setDemoResult] = useState({
    sentiment: 'positive',
    confidence: 98.4,
    aspects: { Battery: 'Positive', Camera: 'Positive', Performance: 'Positive' },
    is_fake: false
  });

  const handleDemoAnalyze = () => {
    const textLower = sampleText.toLowerCase();
    if (textLower.includes('terrible') || textLower.includes('bad') || textLower.includes('broken') || textLower.includes('drain')) {
      setDemoResult({
        sentiment: 'negative',
        confidence: 94.2,
        aspects: { Battery: 'Negative', Performance: 'Negative' },
        is_fake: false
      });
    } else {
      setDemoResult({
        sentiment: 'positive',
        confidence: 98.4,
        aspects: { Battery: 'Positive', Camera: 'Positive', Performance: 'Positive' },
        is_fake: false
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-white selection:bg-indigo-500 selection:text-white">
      {/* Header Bar */}
      <nav className="sticky top-0 z-50 h-20 glass-panel border-b border-white/10 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl glow-primary flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight">
            Senti<span className="text-indigo-400">Verse</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#playground" className="hover:text-white transition-colors">Live Playground</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors px-3 py-2">
            Sign In
          </Link>
          <Link to="/register" className="px-5 py-2.5 rounded-xl glow-primary text-white text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:scale-105 transition-all">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Glow backdrop spheres */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-8 animate-bounce">
          <Sparkles className="w-4 h-4 text-indigo-400" /> Next-Gen AI Sentiment Engine 2.4 Released
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          AI Powered <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Sentiment Analysis</span> for E-Commerce
        </h1>

        <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-normal leading-relaxed">
          Transform raw customer feedback into actionable commercial growth insights. Analyze product reviews in real-time with aspect-level sentiment, emotion detection, and spam prevention.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-2xl glow-primary text-white text-base font-bold shadow-xl shadow-indigo-500/30 hover:scale-105 transition-all flex items-center justify-center gap-2">
            Start Free Trial <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="#playground" className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel border border-white/10 hover:border-indigo-500/40 text-gray-200 text-base font-semibold transition-all">
            Try Live Demo
          </a>
        </div>

        {/* Live Playground Widget */}
        <div id="playground" className="mt-20 glass-panel rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl text-left max-w-4xl mx-auto relative">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-semibold text-gray-400 ml-2">Interactive AI Review Tester</span>
            </div>
            <span className="text-xs font-medium text-indigo-400">96.4% Model Precision</span>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Paste Product Review</label>
            <textarea
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              rows={3}
              className="w-full p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 transition-all"
            ></textarea>

            <div className="flex items-center justify-between">
              <button
                onClick={handleDemoAnalyze}
                className="px-6 py-2.5 rounded-xl glow-primary text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:scale-105 transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4" /> Run Instant AI Analysis
              </button>

              <SentimentBadge sentiment={demoResult.sentiment} confidence={demoResult.confidence} />
            </div>

            {/* Results Preview */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-[11px] text-gray-400 block font-semibold">Aspect Breakdown</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {Object.entries(demoResult.aspects).map(([asp, sent]) => (
                    <span key={asp} className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                      {asp}: {sent}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[11px] text-gray-400 block font-semibold">Spam & Fake Risk</span>
                <span className="text-xs font-bold text-emerald-400 mt-1 inline-block">0.05 (Legitimate Organic Review)</span>
              </div>
              <div>
                <span className="text-[11px] text-gray-400 block font-semibold">Inference Latency</span>
                <span className="text-xs font-bold text-indigo-300 mt-1 inline-block">11.8 ms</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Engineered for Enterprise E-Commerce SaaS
          </h2>
          <p className="mt-4 text-gray-400 text-base">
            From single review diagnostics to multi-thousand CSV batch ingestion, SentiVerse provides end-to-end intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Cpu, title: "Aspect-Based Analysis", desc: "Extract targeted sentiments for battery, display, camera, delivery, packaging, and pricing independently." },
            { icon: ShieldCheck, title: "Fake Review Classifier", desc: "Automatic spam pattern detection flags fake bot reviews and repetitive promotional text." },
            { icon: BarChart3, title: "Bulk CSV Intelligence", desc: "Process thousands of reviews in seconds with live progress tracking and automated executive summaries." },
            { icon: Globe, title: "Language Auto-Translate", desc: "Multilingual review detection translates non-English customer feedback automatically." },
            { icon: Layers, title: "Actionable Recommendations", desc: "AI engine translates negative customer feedback into concrete product engineering improvements." },
            { icon: Zap, title: "Instant REST APIs", desc: "Production-ready Flask endpoints with JWT authentication, role management, and SQLite persistence." }
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="glass-panel glass-panel-hover p-8 rounded-3xl border border-white/10">
                <div className="w-12 h-12 rounded-2xl glow-primary flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-500/20">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">How SentiVerse Works</h2>
          <p className="mt-4 text-gray-400 text-base">Four robust pipeline steps turning raw text into commercial insights.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Text Cleaning", desc: "Regex noise reduction, punctuation normalization & lemmatization." },
            { step: "02", title: "TF-IDF Vectorization", desc: "High-dimensional N-gram feature extraction." },
            { step: "03", title: "Calibrated ML Inference", desc: "Classifies sentiment probabilities & confidence scoring." },
            { step: "04", title: "Aspect & Emotion Output", desc: "Generates aspect breakdown, spam flag, and action points." }
          ].map((s, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl border border-white/10 relative">
              <span className="text-4xl font-black text-indigo-500/30 block mb-2">{s.step}</span>
              <h4 className="text-base font-bold text-white mb-2">{s.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-white">Trusted by E-Commerce Leaders</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { quote: "SentiVerse transformed how we audit thousands of smartphone product reviews. Battery & camera aspect breakdown is unbelievable!", author: "Sarah Lin", role: "Head of Product, TechCorp" },
            { quote: "The fake review detection saved us from hundreds of competitor spam submissions. Highly accurate model!", author: "Marcus Vance", role: "E-Commerce Director, RetailPulse" },
            { quote: "Bulk CSV processing generates executive summaries in seconds. Our product team saves 20 hours every week.", author: "Elena Rostova", role: "Lead Data Analyst, ShopMax" }
          ].map((t, idx) => (
            <div key={idx} className="glass-panel p-8 rounded-3xl border border-white/10 flex flex-col justify-between">
              <p className="text-sm text-gray-300 italic mb-6">"{t.quote}"</p>
              <div>
                <h5 className="text-sm font-bold text-white">{t.author}</h5>
                <p className="text-xs text-indigo-400">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-8 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg glow-primary flex items-center justify-center text-white font-bold text-xs">S</div>
            <span className="font-bold text-white text-sm">SentiVerse AI</span>
          </div>
          <p>© 2026 SentiVerse AI. All rights reserved. E-Commerce Sentiment Platform.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
