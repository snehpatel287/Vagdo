"use client";

import { XMarkIcon } from "@/components/icons";

export default function Toast({ message, actionLabel, onAction, onDismiss }) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900 dark:bg-slate-800 text-white text-sm px-4 py-3 rounded-xl shadow-lg shadow-slate-900/20 border border-slate-800 dark:border-slate-700 max-w-[90vw]">
      <span className="truncate">{message}</span>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="focus-ring font-semibold text-green-400 hover:text-green-300 shrink-0"
        >
          {actionLabel}
        </button>
      )}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="focus-ring flex items-center justify-center w-6 h-6 -mr-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors duration-150 shrink-0"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
