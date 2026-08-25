import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Search, Bell, Sun, Moon, LogOut, User, Shield, 
  Sparkles, CheckCircle2, ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ onOpenSearch }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = [
    { id: 1, title: 'AI Model Re-trained', desc: 'Accuracy upgraded to 96.4%', time: '10m ago' },
    { id: 2, title: 'Bulk Dataset Processed', desc: '500 reviews analyzed successfully', time: '1h ago' },
    { id: 3, title: 'Security Alert', desc: 'New login session from Chrome Windows', time: '2h ago' }
  ];

  return (
    <header className="sticky top-0 z-30 h-16 glass-panel border-b border-white/10 px-6 flex items-center justify-between">
      {/* Global Search Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white text-sm transition-all duration-200 w-64 md:w-80 group cursor-pointer"
        >
          <Search className="w-4 h-4 text-gray-400 group-hover:text-indigo-400" />
          <span className="flex-1 text-left">Search predictions, reviews...</span>
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-white/10 rounded text-gray-300">Ctrl K</kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          AI Engine Online
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 glass-panel rounded-2xl p-4 shadow-2xl border border-white/10 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="font-semibold text-sm text-white">Notifications</span>
                <span className="text-[11px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">3 New</span>
              </div>
              <div className="mt-3 space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-white">{n.title}</h4>
                      <span className="text-[10px] text-gray-400">{n.time}</span>
                    </div>
                    <p className="text-xs text-gray-300 mt-1">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-1.5 pl-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg glow-primary flex items-center justify-center text-white font-bold text-xs">
                {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
              <span className="text-xs font-semibold text-white hidden md:inline-block">{user.full_name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-56 glass-panel rounded-2xl p-2 shadow-2xl border border-white/10 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <p className="text-xs font-semibold text-white">{user.full_name}</p>
                  <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                  {user.role === 'admin' && (
                    <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300">
                      <Shield className="w-3 h-3" /> Admin
                    </span>
                  )}
                </div>

                <Link
                  to="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <User className="w-4 h-4 text-indigo-400" /> Profile & Account
                </Link>

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-purple-400" /> Admin Dashboard
                  </Link>
                )}

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors mt-1"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl glow-primary text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
