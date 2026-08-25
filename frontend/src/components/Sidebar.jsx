import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, MessageSquare, FileSpreadsheet, BarChart2, 
  History, User, Shield, Sparkles, PlusCircle, Globe, FileDown
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/analyze/single', label: 'Single Review', icon: MessageSquare },
    { path: '/analyze/bulk', label: 'Bulk CSV Analysis', icon: FileSpreadsheet },
    { path: '/analytics', label: 'Analytics Engine', icon: BarChart2 },
    { path: '/history', label: 'Prediction History', icon: History },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-white/10 flex flex-col h-screen sticky top-0 z-40 bg-slate-950/80">
      {/* Brand Logo */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl glow-primary flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
            Senti<span className="text-indigo-400">Verse</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">AI</span>
          </h1>
          <p className="text-[10px] text-gray-400 font-medium">E-Commerce Sentiment Engine</p>
        </div>
      </div>

      {/* Quick Analyze Button */}
      <div className="p-4">
        <NavLink
          to="/analyze/single"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl glow-primary text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Analyze New Review
        </NavLink>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto py-2">
        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Core Workspaces
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-inner'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          );
        })}

        {/* Tools & Utilities Section */}
        <div className="pt-4 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Tools & Utilities
        </div>

        <NavLink
          to="/translate"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              isActive ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`
          }
        >
          <Globe className="w-4 h-4" /> Translation Engine
        </NavLink>

        <NavLink
          to="/export"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              isActive ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`
          }
        >
          <FileDown className="w-4 h-4" /> Export Report
        </NavLink>
        <div className="pt-4 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Account & Operations
        </div>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              isActive ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`
          }
        >
          <User className="w-4 h-4" /> Profile & Settings
        </NavLink>

        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10'
              }`
            }
          >
            <Shield className="w-4 h-4" /> Admin Console
          </NavLink>
        )}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/10 bg-white/[0.02]">
        <div className="glass-panel p-3 rounded-xl border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-white">Model v2.4</div>
            <div className="text-[10px] text-emerald-400 font-medium">Acc: 96.4%</div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
