import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4 mb-4">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-rose-100 dark:bg-rose-800 rounded-lg">
          <AlertTriangle className="text-rose-600 dark:text-rose-400" size={20} />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-rose-800 dark:text-rose-200 mb-1">System Error</h3>
          <p className="text-sm text-rose-700 dark:text-rose-300 leading-relaxed">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-rose-600 text-white text-sm rounded-lg hover:bg-rose-700
                     transition-all duration-200 font-semibold
                     flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        )}
      </div>
    </div>
  );
};
