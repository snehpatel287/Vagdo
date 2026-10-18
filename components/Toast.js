"use client";

export default function Toast({ message, actionLabel, onAction, onDismiss }) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg max-w-[90vw]">
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
        className="focus-ring text-slate-400 hover:text-white shrink-0"
      >
        ✕
      </button>
    </div>
  );
}
