import React from 'react';

const SkeletonLoader = ({ type = 'card' }) => {
  if (type === 'table') {
    return (
      <div className="space-y-3 p-4 glass-panel rounded-2xl border border-white/10">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 py-2 border-b border-white/5">
            <div className="h-4 bg-white/10 rounded skeleton-shimmer w-1/4"></div>
            <div className="h-4 bg-white/10 rounded skeleton-shimmer w-1/2"></div>
            <div className="h-4 bg-white/10 rounded skeleton-shimmer w-1/6"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 glass-panel rounded-2xl border border-white/10 space-y-4">
      <div className="h-4 bg-white/10 rounded skeleton-shimmer w-1/3"></div>
      <div className="h-8 bg-white/10 rounded skeleton-shimmer w-1/2"></div>
      <div className="h-3 bg-white/10 rounded skeleton-shimmer w-2/3"></div>
    </div>
  );
};

export default SkeletonLoader;
