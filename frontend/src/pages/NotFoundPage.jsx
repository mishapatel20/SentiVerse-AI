import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="w-16 h-16 rounded-2xl glow-primary flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/30">
        <Sparkles className="w-8 h-8 text-white" />
      </div>

      <h1 className="text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
        404
      </h1>
      <h2 className="text-2xl font-bold text-white mt-2">Page Not Found</h2>
      <p className="text-xs text-gray-400 max-w-sm mt-2">
        The requested resource or workspace view could not be located in SentiVerse AI.
      </p>

      <Link
        to="/dashboard"
        className="mt-8 px-6 py-3 rounded-xl glow-primary text-white font-bold text-xs shadow-lg shadow-indigo-500/25 hover:scale-105 transition-all flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
