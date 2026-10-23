"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getTrees, deleteTree } from "@/lib/trees";
import { exportAsCsv } from "@/lib/export";
import TreeCard from "@/components/TreeCard";
import TreeTypeFilter from "@/components/TreeTypeFilter";
import Toast from "@/components/Toast";
import { useAddTreeModal, TREE_ADDED_EVENT } from "@/lib/ui/AddTreeModalContext";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  ArrowsUpDownIcon,
  CalendarIcon,
  ChevronDownIcon,
  DownloadIcon,
  FilterIcon,
  LeafIcon,
  MapIcon,
  PlusIcon,
  SearchIcon,
  TreeIcon,
  XMarkIcon,
} from "@/components/icons";

const UNDO_DELAY = 5000;

const DATE_RANGE_DAYS = {
  all: null,
  "7d": 7,
  "1m": 30,
  "2m": 60,
  "3m": 90,
  "6m": 180,
  "1y": 365,
};

export default function Home() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const [trees, setTrees] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [typeFilter, setTypeFilter] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [dateRange, setDateRange] = useState("all");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [loadError, setLoadError] = useState("");
  const pendingTimeoutRef = useRef(null);
  const { openModal } = useAddTreeModal();

  async function refreshTrees() {
    try {
      setTrees(await getTrees());
    } catch (err) {
      setLoadError(err.message || "Could not load trees.");
    }
  }

  useEffect(() => {
    refreshTrees().finally(() => setLoaded(true));
    window.addEventListener(TREE_ADDED_EVENT, refreshTrees);
    return () => {
      if (pendingTimeoutRef.current) clearTimeout(pendingTimeoutRef.current);
      window.removeEventListener(TREE_ADDED_EVENT, refreshTrees);
    };
  }, []);

  function finalizePendingDelete() {
    if (pendingTimeoutRef.current) {
      clearTimeout(pendingTimeoutRef.current);
      pendingTimeoutRef.current = null;
    }
  }

  function handleDelete(id) {
    // If a previous delete is still pending undo, commit it now.
    if (pendingDelete) {
      finalizePendingDelete();
      deleteTree(pendingDelete.id).catch(() => {});
      setTrees((prev) => prev.filter((t) => t.id !== pendingDelete.id));
    }
    const tree = trees.find((t) => t.id === id);
    pendingTimeoutRef.current = setTimeout(async () => {
      await deleteTree(id).catch(() => {});
      await refreshTrees();
      setPendingDelete(null);
      pendingTimeoutRef.current = null;
    }, UNDO_DELAY);
    setPendingDelete({ id, name: tree?.name });
  }

  function handleUndoDelete() {
    finalizePendingDelete();
    setPendingDelete(null);
  }

  async function handleDismissToast() {
    if (!pendingDelete) return;
    finalizePendingDelete();
    await deleteTree(pendingDelete.id).catch(() => {});
    await refreshTrees();
    setPendingDelete(null);
  }


  const visibleTrees = useMemo(
    () => trees.filter((t) => t.id !== pendingDelete?.id),
    [trees, pendingDelete]
  );

  const availableTypes = useMemo(() => {
    const map = new Map();
    visibleTrees.forEach((t) => {
      if (!map.has(t.name)) map.set(t.name, t.color);
    });
    return Array.from(map, ([name, color]) => ({ name, color }));
  }, [visibleTrees]);

  const locatedCount = useMemo(
    () => visibleTrees.filter((t) => t.latitude && t.longitude).length,
    [visibleTrees]
  );

  const filteredTrees = useMemo(() => {
    let result = visibleTrees;

    if (typeFilter) {
      result = result.filter((t) => t.name === typeFilter);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.location?.toLowerCase().includes(q)
      );
    }

    const days = DATE_RANGE_DAYS[dateRange];
    if (days) {
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      result = result.filter((t) => new Date(t.created_at).getTime() >= cutoff);
    }

    result = [...result];
    if (sortBy === "oldest") {
      result.reverse();
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
    // "newest" is already the default order from getTrees()

    return result;
  }, [visibleTrees, typeFilter, search, sortBy, dateRange]);

  const filtersActive =
    typeFilter !== null || search.trim() !== "" || dateRange !== "all";

  function clearFilters() {
    setTypeFilter(null);
    setSearch("");
    setDateRange("all");
  }

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
      <div className="flex items-center justify-between mb-6 gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {isAdmin ? "All Trees" : "Your Trees"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {filtersActive
              ? `${filteredTrees.length} of ${visibleTrees.length} tree${visibleTrees.length === 1 ? "" : "s"}`
              : isAdmin
                ? `${visibleTrees.length} tree${visibleTrees.length === 1 ? "" : "s"} across everyone`
                : `${visibleTrees.length} tree${visibleTrees.length === 1 ? "" : "s"} tracked`}
          </p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="focus-ring sm:hidden flex items-center gap-1.5 min-h-[44px] bg-green-600 text-white px-4 rounded-xl text-sm font-semibold shadow-sm shadow-green-600/20 transition-colors duration-150 shrink-0"
        >
          <PlusIcon className="w-4 h-4" strokeWidth={2} />
          Add
        </button>
      </div>

      {loadError && (
        <p className="mb-6 text-sm text-red-600 dark:text-red-400">{loadError}</p>
      )}

      {loaded && visibleTrees.length > 0 && (
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3 transition-shadow duration-150 hover:shadow-sm">
            <span className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 shrink-0">
              <TreeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {visibleTrees.length}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                Trees
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3 transition-shadow duration-150 hover:shadow-sm">
            <span className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
              <LeafIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {availableTypes.length}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                Species
              </p>
            </div>
          </div>

          <Link
            href="/map"
            className="focus-ring bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3 hover:border-blue-300 dark:hover:border-blue-500/40 hover:shadow-sm transition-all duration-150"
          >
            <span className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
              <MapIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {locatedCount}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                On map
              </p>
            </div>
          </Link>
        </div>
      )}

      {loaded && visibleTrees.length > 0 && (
        <div className="flex flex-wrap items-end gap-3 sm:gap-4 mb-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 sm:p-4">
          <div className="flex-1 min-w-[160px]">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              <SearchIcon className="w-3.5 h-3.5" />
              Search
            </label>
            <div className="relative">
              <SearchIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name or location..."
                className="focus-ring w-full min-h-[40px] border border-slate-300 dark:border-slate-600 rounded-xl pl-9 pr-3 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition-shadow duration-150"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              <ArrowsUpDownIcon className="w-3.5 h-3.5" />
              Sort
            </label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="focus-ring appearance-none min-h-[40px] border border-slate-300 dark:border-slate-600 rounded-xl pl-3 pr-8 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition-shadow duration-150"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="name">Name A-Z</option>
              </select>
              <ChevronDownIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              <FilterIcon className="w-3.5 h-3.5" />
              Tree Type
            </label>
            <TreeTypeFilter
              types={availableTypes}
              value={typeFilter}
              onChange={setTypeFilter}
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              <CalendarIcon className="w-3.5 h-3.5" />
              Date Added
            </label>
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="focus-ring appearance-none min-h-[40px] border border-slate-300 dark:border-slate-600 rounded-xl pl-3 pr-8 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition-shadow duration-150"
              >
                <option value="all">All time</option>
                <option value="7d">Last 7 days</option>
                <option value="1m">Last 1 month</option>
                <option value="2m">Last 2 months</option>
                <option value="3m">Last 3 months</option>
                <option value="6m">Last 6 months</option>
                <option value="1y">Last 1 year</option>
              </select>
              <ChevronDownIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {filtersActive && (
            <button
              type="button"
              onClick={clearFilters}
              className="focus-ring flex items-center gap-1 min-h-[40px] px-3 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-150"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
              Clear
            </button>
          )}

          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={() => exportAsCsv(filteredTrees)}
              className="focus-ring flex items-center gap-1.5 min-h-[40px] px-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:border-slate-400 dark:hover:border-slate-500 transition-colors duration-150"
            >
              <DownloadIcon className="w-3.5 h-3.5" />
              CSV
            </button>
          </div>
        </div>
      )}

      {!loaded ? null : visibleTrees.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 sm:py-24 px-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-white/50 dark:bg-slate-800/30">
          <span className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-600/25 mb-4">
            <LeafIcon className="w-8 h-8" />
          </span>
          <p className="text-slate-800 dark:text-slate-200 font-semibold">No trees yet</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-5 max-w-xs">
            Add your first tree with a photo, type, and location.
          </p>
          <button
            type="button"
            onClick={openModal}
            className="focus-ring flex items-center gap-1.5 min-h-[44px] bg-green-600 hover:bg-green-700 text-white px-5 rounded-xl text-sm font-semibold shadow-sm shadow-green-600/20 transition-colors duration-150"
          >
            <PlusIcon className="w-4 h-4" strokeWidth={2} />
            Add Tree
          </button>
        </div>
      ) : filteredTrees.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 sm:py-24 px-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-white/50 dark:bg-slate-800/30">
          <p className="text-slate-800 dark:text-slate-200 font-semibold">No trees match these filters</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-5">
            Try a different search term, tree type, or date range.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="focus-ring flex items-center gap-1.5 min-h-[44px] bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-5 rounded-xl text-sm font-semibold transition-colors duration-200"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {filteredTrees.map((tree) => (
            <TreeCard
              key={tree.id}
              tree={tree}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {pendingDelete && (
        <Toast
          message={`Deleted ${pendingDelete.name || "tree"}`}
          actionLabel="Undo"
          onAction={handleUndoDelete}
          onDismiss={handleDismissToast}
        />
      )}
    </main>
  );
}
