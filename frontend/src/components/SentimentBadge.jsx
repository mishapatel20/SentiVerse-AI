import React from 'react';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

const SentimentBadge = ({ sentiment, confidence, showConfidence = true }) => {
  const s = String(sentiment).toLowerCase();

  if (s === 'positive') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
        <ThumbsUp className="w-3.5 h-3.5" />
        Positive
        {showConfidence && confidence && <span className="text-emerald-500/70 font-normal ml-0.5">({confidence}%)</span>}
      </span>
    );
  }

  if (s === 'negative') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm">
        <ThumbsDown className="w-3.5 h-3.5" />
        Negative
        {showConfidence && confidence && <span className="text-rose-500/70 font-normal ml-0.5">({confidence}%)</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm">
      <Minus className="w-3.5 h-3.5" />
      Neutral
      {showConfidence && confidence && <span className="text-amber-500/70 font-normal ml-0.5">({confidence}%)</span>}
    </span>
  );
};

export default SentimentBadge;
