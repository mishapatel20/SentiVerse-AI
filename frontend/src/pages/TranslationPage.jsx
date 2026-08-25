import React, { useState, useEffect } from 'react';
import { translateAPI } from '../services/api';
import { 
  Globe, ArrowRightLeft, Copy, CheckCheck, 
  RefreshCw, Sparkles, Volume2, FileText, Trash2
} from 'lucide-react';

const POPULAR_LANGS = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ar', name: 'Arabic' },
  { code: 'zh-CN', name: 'Chinese' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'it', name: 'Italian' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ta', name: 'Tamil' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ur', name: 'Urdu' },
  { code: 'tr', name: 'Turkish' },
];

const SAMPLE_REVIEWS = [
  { lang: 'Spanish', text: 'Excelente calidad de pantalla y cámara trasera. La batería dura todo el día. Muy satisfecho con el servicio.' },
  { lang: 'French', text: 'Très bon produit ! La livraison était rapide. La qualité de la batterie est excellente.' },
  { lang: 'German', text: 'Sehr schlechtes Produkt. Die Batterie hält nicht lange. Die Qualität ist sehr enttäuschend.' },
  { lang: 'Hindi', text: 'यह उत्पाद बहुत अच्छा है। बैटरी लाइफ शानदार है। कैमरा बहुत साफ तस्वीरें लेता है।' },
];

const TranslationPage = () => {
  const [inputText, setInputText] = useState('');
  const [targetLang, setTargetLang] = useState('en');
  const [allLanguages, setAllLanguages] = useState(POPULAR_LANGS);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  // Bulk translation state
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkTexts, setBulkTexts] = useState('');
  const [bulkResults, setBulkResults] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    translateAPI.getLanguages()
      .then(res => setAllLanguages(res.data.languages))
      .catch(() => setAllLanguages(POPULAR_LANGS));
  }, []);

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError('Please enter text to translate.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await translateAPI.translateText({
        text: inputText,
        target_language: targetLang
      });
      setResult(res.data);
      // Add to local session history
      setHistory(prev => [res.data, ...prev.slice(0, 9)]);
    } catch (err) {
      setError(err.response?.data?.error || 'Translation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkTranslate = async () => {
    const lines = bulkTexts.split('\n').filter(l => l.trim());
    if (!lines.length) {
      setError('Please enter at least one line of text for bulk translation.');
      return;
    }
    setError('');
    setBulkLoading(true);
    setBulkResults([]);
    try {
      const res = await translateAPI.translateBulk({
        texts: lines,
        target_language: targetLang
      });
      setBulkResults(res.data.results);
    } catch (err) {
      setError(err.response?.data?.error || 'Bulk translation failed.');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwapLanguages = () => {
    if (result) {
      setInputText(result.translated_text);
      setTargetLang(result.source_language !== 'unknown' ? result.source_language : 'en');
      setResult(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Translation Engine <Globe className="w-5 h-5 text-indigo-400" />
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Translate product reviews across 25+ languages using Google Translate backend.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-2 glass-panel p-1.5 rounded-xl border border-white/10">
          <button
            onClick={() => setBulkMode(false)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${!bulkMode ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Single Text
          </button>
          <button
            onClick={() => setBulkMode(true)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${bulkMode ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Bulk (Multi-line)
          </button>
        </div>
      </div>

      {/* Quick Sample Loaders */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Try a sample:</span>
        {SAMPLE_REVIEWS.map((s, idx) => (
          <button key={idx} onClick={() => { setInputText(s.text); setResult(null); setBulkMode(false); }}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-300 hover:text-white transition-all cursor-pointer">
            {s.lang} Review
          </button>
        ))}
      </div>

      {!bulkMode ? (
        /* ── SINGLE TRANSLATION MODE ── */
        <div className="space-y-4">
          {/* Target Language Selector */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5 tracking-wider">Translate To</label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {allLanguages.map(l => (
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
            </div>

            {result && (
              <div className="flex items-center gap-2 text-xs text-indigo-300 glass-panel px-4 py-2 rounded-xl border border-indigo-500/20">
                <Globe className="w-4 h-4" />
                Detected: <strong>{result.source_language_name}</strong>
              </div>
            )}
          </div>

          {/* Translation Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input Panel */}
            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Source Text</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500">{inputText.length}/5000</span>
                  {inputText && (
                    <button onClick={() => { setInputText(''); setResult(null); }}
                      className="p-1 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <textarea
                rows={8}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste any product review in any language here..."
                className="w-full bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none resize-none"
              />
              {error && <div className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">{error}</div>}
              <button
                onClick={handleTranslate}
                disabled={loading || !inputText.trim()}
                className="w-full py-2.5 rounded-xl glow-primary text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                {loading ? 'Translating...' : 'Translate Now'}
              </button>
            </div>

            {/* Output Panel */}
            <div className={`glass-panel p-5 rounded-3xl border transition-all ${result ? 'border-indigo-500/30' : 'border-white/10'} space-y-3`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Translated Text {result && `→ ${result.target_language_name}`}
                </span>
                <div className="flex items-center gap-2">
                  {result && (
                    <>
                      <button
                        onClick={() => handleCopy(result.translated_text)}
                        className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        title="Copy translation"
                      >
                        {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={handleSwapLanguages}
                        className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        title="Swap languages"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {result ? (
                <div className="space-y-3">
                  <p className="text-sm text-white leading-relaxed min-h-[120px]">
                    {result.translated_text}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      Source: {result.source_language_name}
                    </span>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      Target: {result.target_language_name}
                    </span>
                    {result.was_translated && (
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        ✓ Auto-Translated
                      </span>
                    )}
                    {!result.success && (
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        ⚠ Offline Fallback
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[160px] text-gray-500 space-y-2">
                  <Globe className="w-10 h-10 text-gray-700" />
                  <p className="text-xs">Translation will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ── BULK TRANSLATION MODE ── */
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5 tracking-wider">Translate All Lines To</label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {allLanguages.map(l => (
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-400 max-w-xs">Enter one review per line. Up to 100 texts per batch.</p>
          </div>

          <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-3">
            <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              Multi-Line Input (One review per line)
            </label>
            <textarea
              rows={8}
              value={bulkTexts}
              onChange={(e) => setBulkTexts(e.target.value)}
              placeholder={"Line 1: Excelente calidad de pantalla...\nLine 2: Sehr schlechtes Produkt...\nLine 3: यह उत्पाद बहुत अच्छा है..."}
              className="w-full bg-slate-900/70 rounded-xl border border-white/10 text-white placeholder-gray-600 text-sm p-4 focus:outline-none focus:border-indigo-500 font-mono resize-none"
            />
            {error && <div className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">{error}</div>}
            <button
              onClick={handleBulkTranslate}
              disabled={bulkLoading || !bulkTexts.trim()}
              className="px-6 py-2.5 rounded-xl glow-primary text-white text-xs font-bold hover:scale-105 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {bulkLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {bulkLoading ? 'Translating Batch...' : `Translate ${bulkTexts.split('\n').filter(l => l.trim()).length} Lines`}
            </button>
          </div>

          {/* Bulk Results Table */}
          {bulkResults.length > 0 && (
            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Bulk Translation Results ({bulkResults.length})</h3>
                <button
                  onClick={() => {
                    const csv = 'Original,Translated,SourceLang\n' +
                      bulkResults.map(r => `"${r.original_text.replace(/"/g, '""')}","${r.translated_text.replace(/"/g, '""')}","${r.source_language_name}"`).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = 'bulk_translations.csv'; a.click();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" /> Export CSV
                </button>
              </div>
              <div className="space-y-3">
                {bulkResults.map((r, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Original ({r.source_language_name})</span>
                      <p className="text-xs text-gray-200">{r.original_text}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-1">Translated ({r.target_language_name})</span>
                      <p className="text-xs text-white font-medium">{r.translated_text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Session Translation History */}
      {history.length > 0 && !bulkMode && (
        <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Session History</h3>
            <button onClick={() => setHistory([])} className="text-xs text-gray-400 hover:text-rose-400 transition-colors cursor-pointer">Clear</button>
          </div>
          <div className="space-y-2">
            {history.map((h, idx) => (
              <button
                key={idx}
                onClick={() => { setInputText(h.original_text); setTargetLang(h.target_language); setResult(h); }}
                className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
              >
                <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                  <span>{h.source_language_name} → {h.target_language_name}</span>
                </div>
                <p className="text-xs text-gray-200 truncate">{h.original_text}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslationPage;
