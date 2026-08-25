import React, { useState, useEffect } from 'react';
import { Search, X, MessageSquare, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else window.dispatchEvent(new CustomEvent('open-search'));
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    { title: 'Single Review Analyzer', desc: 'Paste text to run AI sentiment analysis', path: '/analyze/single', icon: MessageSquare },
    { title: 'Bulk CSV Dataset Upload', desc: 'Upload CSV to analyze hundreds of reviews', path: '/analyze/bulk', icon: FileText },
    { title: 'View Analytics Engine', desc: 'Inspect confidence & aspect distribution', path: '/analytics', icon: ArrowRight },
    { title: 'Prediction History', desc: 'Search & filter past review predictions', path: '/history', icon: ArrowRight },
  ];

  const filteredActions = quickActions.filter(a => 
    a.title.toLowerCase().includes(query.toLowerCase()) || 
    a.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Search Input */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-400" />
          <input
            type="text"
            placeholder="Type a command or search feature..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none"
          />
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results / Suggestions */}
        <div className="p-3 max-h-80 overflow-y-auto space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Quick Navigation & Actions
          </div>
          {filteredActions.map((act, idx) => {
            const Icon = act.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  navigate(act.path);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-indigo-600/20 hover:border hover:border-indigo-500/30 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5 group-hover:bg-indigo-500/20 text-indigo-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{act.title}</h4>
                    <p className="text-[11px] text-gray-400">{act.desc}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 transition-transform group-hover:translate-x-1" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
