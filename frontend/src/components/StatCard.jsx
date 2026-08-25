import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, change, isIncrease, icon: Icon, color = 'indigo' }) => {
  const colorMap = {
    indigo: 'from-indigo-500/20 to-indigo-500/5 text-indigo-400 border-indigo-500/20',
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20',
    rose: 'from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/20',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/20',
    purple: 'from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/20'
  };

  return (
    <div className={`relative overflow-hidden glass-panel glass-panel-hover p-6 rounded-2xl border bg-gradient-to-br ${colorMap[color] || colorMap.indigo}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</span>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div className="text-3xl font-extrabold tracking-tight text-white">{value}</div>
        {change && (
          <div className={`flex items-center text-xs font-medium ${isIncrease ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isIncrease ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
            {change}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
