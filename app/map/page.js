"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getTrees } from "@/lib/trees";
import { MapIcon, SpinnerIcon } from "@/components/icons";

const TreeMap = dynamic(() => import("@/components/TreeMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500 text-sm">
      <SpinnerIcon className="w-4 h-4" />
      Loading map...
    </div>
  ),
});

export default function MapPage() {
  const [trees, setTrees] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getTrees()
      .then(setTrees)
      .catch(() => setTrees([]))
      .finally(() => setLoaded(true));
  }, []);

  const withLocation = trees.filter((t) => t.latitude && t.longitude).length;

  return (
    <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)]">
      <div className="flex items-center justify-between mb-3 sm:mb-4 shrink-0">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Tree Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {withLocation > 0
              ? `${withLocation} tree${withLocation === 1 ? "" : "s"} located`
              : "Trees with a saved location appear here"}
          </p>
        </div>
      </div>

      {!loaded ? null : withLocation === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-white/50 dark:bg-slate-800/30">
          <span className="flex items-center justify-center w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 mb-4">
            <MapIcon className="w-8 h-8" />
          </span>
          <p className="text-slate-800 dark:text-slate-200 font-semibold">
            No trees on the map yet
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-xs">
            Add a tree and use the location pin button or a search
            suggestion to save its location.
          </p>
        </div>
      ) : (
        <div className="relative flex-1 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-slate-100 dark:bg-slate-800">
          <TreeMap trees={trees} />
        </div>
      )}
    </main>
  );
}
