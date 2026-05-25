import React from 'react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

function ErrorAlert({ message, onRetry }) {
  return (
    <div className="p-5 bg-red-950/20 border border-red-500/25 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn my-4">
      <div className="flex items-start sm:items-center gap-3 text-red-400">
        <FaExclamationTriangle className="text-xl shrink-0 mt-0.5 sm:mt-0" />
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider">System Exception Occurred</h4>
          <p className="text-xs text-slate-300 mt-1 font-sans">{message || 'Unable to sync updates with server database pools.'}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/15 border border-red-500/30 hover:border-red-500/50 text-red-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all shrink-0 cursor-pointer"
        >
          <FaRedo className="text-[10px]" /> Retry Fetch
        </button>
      )}
    </div>
  );
}

export default ErrorAlert;
