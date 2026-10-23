"use client";

import { useEffect, useRef, useState } from "react";
import { getTreeTypes, addTreeType, CATEGORIES, DEFAULT_CATEGORY } from "@/lib/treeTypes";
import { ChevronDownIcon, FilterIcon, PlusIcon } from "@/components/icons";

export default function TreeTypeSelect({ value, color, onChange, invalid }) {
  const [open, setOpen] = useState(false);
  const [types, setTypes] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState(DEFAULT_CATEGORY);
  const boxRef = useRef(null);

  useEffect(() => {
    setTypes(getTreeTypes());
  }, []);

  const visibleTypes = categoryFilter
    ? types.filter((t) => (t.category || DEFAULT_CATEGORY) === categoryFilter)
    : types;

  useEffect(() => {
    function handleClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
        setAdding(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectType(type) {
    onChange(type.name, type.color);
    setOpen(false);
    setAdding(false);
  }

  function confirmAdd() {
    const type = addTreeType(newName, newCategory);
    if (!type) return;
    setTypes(getTreeTypes());
    setNewName("");
    setNewCategory(DEFAULT_CATEGORY);
    selectType(type);
  }

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`focus-ring w-full flex items-center gap-2 min-h-[44px] border rounded-xl px-3.5 text-left bg-white dark:bg-slate-800 transition-shadow duration-150 ${
          open
            ? "border-green-500 ring-2 ring-green-500/30"
            : invalid
              ? "border-red-300"
              : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
        }`}
      >
        {value ? (
          <>
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: color || "#9ca3af" }}
              aria-hidden="true"
            />
            <span className="text-slate-900 dark:text-slate-100 text-sm sm:text-base truncate">
              {value}
            </span>
          </>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 text-sm sm:text-base">
            Select a tree type
          </span>
        )}
        <ChevronDownIcon
          className={`w-4 h-4 ml-auto text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-10 mt-1.5 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-80 overflow-hidden flex flex-col"
        >
          <div className="flex items-center gap-1.5 px-2.5 py-2 border-b border-slate-100 dark:border-slate-700/60 overflow-x-auto">
            <FilterIcon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 ml-0.5" />
            <button
              type="button"
              onClick={() => setCategoryFilter(null)}
              className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-colors duration-150 ${
                categoryFilter === null
                  ? "bg-green-600 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-colors duration-150 ${
                  categoryFilter === cat
                    ? "bg-green-600 text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="min-h-0 overflow-y-auto overflow-x-hidden py-1">
            {visibleTypes.length === 0 && (
              <p className="px-3.5 py-3 text-sm text-slate-400 dark:text-slate-500">
                No tree types in this category yet.
              </p>
            )}
            {visibleTypes.map((type) => (
              <button
                key={type.name}
                type="button"
                role="option"
                aria-selected={value === type.name}
                onClick={() => selectType(type)}
                className="focus-ring w-full flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] hover:bg-slate-50 dark:hover:bg-slate-700/60 text-left text-sm sm:text-base"
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: type.color }}
                  aria-hidden="true"
                />
                <span className="text-slate-900 dark:text-slate-100">{type.name}</span>
                <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
                  {type.category || DEFAULT_CATEGORY}
                </span>
              </button>
            ))}

            <div className="border-t border-slate-100 dark:border-slate-700/60 mt-1 pt-1">
              {adding ? (
                <div className="flex flex-col gap-2 px-3 py-2">
                  <input
                    autoFocus
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && confirmAdd()}
                    placeholder="New tree type name"
                    aria-label="New tree type name"
                    className="focus-ring w-full min-w-0 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-2 text-sm focus:border-green-500"
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      aria-label="New tree type category"
                      className="focus-ring flex-1 min-w-0 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-2 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:border-green-500"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={confirmAdd}
                      className="focus-ring shrink-0 rounded-lg text-sm text-green-700 dark:text-green-400 font-semibold px-3 py-2 hover:bg-green-50 dark:hover:bg-green-500/10"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className="focus-ring w-full flex items-center gap-1.5 text-left px-3.5 py-2.5 min-h-[44px] text-sm text-green-700 dark:text-green-400 font-semibold hover:bg-green-50 dark:hover:bg-green-500/10"
                >
                  <PlusIcon className="w-4 h-4" strokeWidth={2} />
                  Add new tree type
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
