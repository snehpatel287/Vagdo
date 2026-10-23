"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { addTree } from "@/lib/trees";
import { useAddTreeModal, notifyTreeAdded } from "@/lib/ui/AddTreeModalContext";
import TreeForm from "@/components/TreeForm";
import { LeafIcon, XMarkIcon } from "@/components/icons";

export default function AddTreeModal() {
  const { open, closeModal } = useAddTreeModal();
  const router = useRouter();
  const pathname = usePathname();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    function handleKeyDown(e) {
      if (e.key === "Escape") closeModal();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, closeModal]);

  if (!open) return null;

  async function handleSubmit(data) {
    await addTree(data);
    notifyTreeAdded();
    closeModal();
    if (pathname !== "/") router.push("/");
  }

  function handleBackdropClick(e) {
    if (panelRef.current && !panelRef.current.contains(e.target)) {
      closeModal();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto"
      onMouseDown={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Add a Tree"
    >
      <div
        ref={panelRef}
        className="relative w-full sm:max-w-xl bg-white dark:bg-slate-800 sm:rounded-2xl shadow-xl sm:my-8 min-h-screen sm:min-h-0"
      >
        <div className="sticky top-0 z-10 flex items-center gap-3 px-5 sm:px-8 py-5 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700/60 sm:rounded-t-2xl">
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-green-600 text-white shrink-0">
            <LeafIcon className="w-5 h-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Add a Tree
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Record the type, location, and photos of the tree.
            </p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            aria-label="Close"
            className="focus-ring shrink-0 flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-150"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 sm:px-8 py-5 sm:py-6">
          <TreeForm embedded submitLabel="Save Tree" onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
