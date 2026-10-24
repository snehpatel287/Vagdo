"use client";

import { useEffect } from "react";
import { useConfirmDialogState } from "@/lib/ui/ConfirmDialogContext";
import { AlertTriangleIcon, CheckCircleIcon } from "@/components/icons";

export default function ConfirmDialog() {
  const { request, settle } = useConfirmDialogState();

  useEffect(() => {
    if (!request) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") settle(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [request]);

  if (!request) return null;

  const { title, message, confirmLabel, cancelLabel, danger } = request;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) settle(false);
      }}
    >
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-5 sm:p-6">
        <div className="flex items-start gap-3 mb-4">
          <span
            className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${
              danger
                ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                : "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400"
            }`}
          >
            {danger ? (
              <AlertTriangleIcon className="w-5 h-5" />
            ) : (
              <CheckCircleIcon className="w-5 h-5" />
            )}
          </span>
          <div className="min-w-0 pt-1">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
            {message && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => settle(false)}
            className="focus-ring min-h-[40px] px-4 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-150"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            autoFocus
            onClick={() => settle(true)}
            className={`focus-ring min-h-[40px] px-4 rounded-xl text-sm font-semibold text-white transition-colors duration-150 ${
              danger
                ? "bg-red-600 hover:bg-red-700 active:bg-red-800"
                : "bg-green-600 hover:bg-green-700 active:bg-green-800"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
