import React from 'react';
import { Factory } from 'lucide-react';

export const LoadingMessage: React.FC = () => {
  return (
    <div className="flex gap-4 mb-6 animate-fade-in" role="status" aria-live="polite" aria-label="AI is processing your message">
      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                      bg-gradient-to-br from-slate-700 to-blue-900 shadow-lg ring-2 ring-amber-400/30">
        <Factory size={16} className="text-amber-400" />
      </div>

      <div className="flex-1 max-w-4xl">
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
          <Factory size={12} className="text-amber-500" />
          CemtrAS AI
        </div>
        <div className="inline-block px-4 py-3 rounded-xl rounded-bl-md
                        bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Pulsing dots animation */}
            <div className="flex gap-1.5" aria-hidden="true">
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0ms', animationDuration: '1s' }}></div>
              <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: '200ms', animationDuration: '1s' }}></div>
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '400ms', animationDuration: '1s' }}></div>
            </div>
            {/* Shimmer text */}
            <div className="relative overflow-hidden">
              <span className="text-sm text-slate-700 dark:text-slate-300 font-medium block">
                Analyzing your query...
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-slate-600/30 animate-shimmer"></div>
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium" aria-label="Message source">
          CemtrAS AI • Processing...
        </div>
      </div>
    </div>
  );
};
