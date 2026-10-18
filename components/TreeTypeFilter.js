"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/icons";

export default function TreeTypeFilter({ types, value, onChange }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = types.find((t) => t.name === value);

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`focus-ring flex items-center gap-2 min-h-[40px] border rounded-xl px-3 text-left bg-white dark:bg-slate-800 transition-shadow duration-150 ${
          open
            ? "border-green-500 ring-2 ring-green-500/30"
            : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
        }`}
      >
        {selected ? (
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: selected.color }}
            aria-hidden="true"
          />
        ) : null}
        <span className="text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
          {selected ? selected.name : "All types"}
        </span>
        <ChevronDownIcon
          className={`w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-10 mt-1.5 min-w-full w-max bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-64 overflow-auto py-1"
        >
          <button
            type="button"
            role="option"
            aria-selected={!value}
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className="focus-ring w-full flex items-center px-3.5 py-2.5 min-h-[40px] hover:bg-slate-50 dark:hover:bg-slate-700/60 text-left text-sm text-slate-700 dark:text-slate-300"
          >
            All types
          </button>
          {types.map((type) => (
            <button
              key={type.name}
              type="button"
              role="option"
              aria-selected={value === type.name}
              onClick={() => {
                onChange(type.name);
                setOpen(false);
              }}
              className="focus-ring w-full flex items-center gap-2 px-3.5 py-2.5 min-h-[40px] hover:bg-slate-50 dark:hover:bg-slate-700/60 text-left text-sm"
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: type.color }}
                aria-hidden="true"
              />
              <span className="text-slate-900 dark:text-slate-100 whitespace-nowrap">
                {type.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
