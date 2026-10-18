"use client";

import { useEffect, useRef, useState } from "react";
import { getTreeTypes, addTreeType } from "@/lib/treeTypes";
import { ChevronDownIcon, PlusIcon } from "@/components/icons";

export default function TreeTypeSelect({ value, color, onChange, invalid }) {
  const [open, setOpen] = useState(false);
  const [types, setTypes] = useState([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const boxRef = useRef(null);

  useEffect(() => {
    setTypes(getTreeTypes());
  }, []);

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
    const type = addTreeType(newName);
    if (!type) return;
    setTypes(getTreeTypes());
    setNewName("");
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
          className="absolute z-10 mt-1.5 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-64 overflow-auto py-1"
        >
          {types.map((type) => (
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
            </button>
          ))}

          <div className="border-t border-slate-100 dark:border-slate-700/60 mt-1 pt-1">
            {adding ? (
              <div className="flex items-center gap-2 px-3 py-1.5">
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && confirmAdd()}
                  placeholder="New tree type name"
                  aria-label="New tree type name"
                  className="focus-ring flex-1 min-w-0 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-2 text-sm focus:border-green-500"
                />
                <button
                  type="button"
                  onClick={confirmAdd}
                  className="focus-ring rounded-lg text-sm text-green-700 font-semibold px-2 py-2 hover:bg-green-50"
                >
                  Add
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="focus-ring w-full flex items-center gap-1.5 text-left px-3.5 py-2.5 min-h-[44px] text-sm text-green-700 font-semibold hover:bg-green-50"
              >
                <PlusIcon className="w-4 h-4" strokeWidth={2} />
                Add new tree type
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
