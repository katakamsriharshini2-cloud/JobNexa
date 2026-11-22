import React from 'react';

const Loading = ({ fullScreen = false, text = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
        <div className="relative w-16 h-16">
          <div className="w-16 h-16 rounded-full border-4 border-blue-200 dark:border-slate-700 animate-spin border-t-blue-600 dark:border-t-purple-500"></div>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-blue-600 dark:text-purple-400">
            JN
          </div>
        </div>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 animate-pulse">
          {text}
        </p>
      </div>
    );
  }

  return (
    <div className="py-12 flex flex-col items-center justify-center space-y-3">
      <div className="w-10 h-10 rounded-full border-3 border-blue-200 dark:border-slate-700 animate-spin border-t-blue-600 dark:border-t-purple-500"></div>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{text}</p>
    </div>
  );
};

export default Loading;
