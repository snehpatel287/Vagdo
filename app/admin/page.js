"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import { getTrees, deleteTree } from "@/lib/trees";
import {
  getTreeTypes,
  addTreeType,
  updateTreeType,
  deleteTreeType,
  COLOR_PALETTE,
  DEFAULT_CATEGORY,
} from "@/lib/treeTypes";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/categories";
import {
  getHealthStatuses,
  addHealthStatus,
  updateHealthStatus,
  deleteHealthStatus,
} from "@/lib/healthStatuses";
import {
  getLocationTypes,
  addLocationType,
  updateLocationType,
  deleteLocationType,
} from "@/lib/locationTypes";
import { useReferenceData } from "@/lib/reference/ReferenceDataProvider";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useConfirm } from "@/lib/ui/ConfirmDialogContext";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  LockIcon,
  MailIcon,
  PencilIcon,
  PlusIcon,
  ShieldIcon,
  SpinnerIcon,
  TrashIcon,
  TreeIcon,
  UnlockIcon,
  UserIcon,
  UserPlusIcon,
  XMarkIcon,
} from "@/components/icons";

const TABS = [
  { key: "trees", label: "All Trees" },
  { key: "types", label: "Tree Types" },
  { key: "lists", label: "Form Settings" },
  { key: "users", label: "Manage Users" },
];

export default function AdminPage() {
  const [tab, setTab] = useState("trees");

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
      <div className="flex items-center gap-3 mb-6">
        <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-green-600 text-white shrink-0">
          <ShieldIcon className="w-5 h-5" />
        </span>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Admin
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage every tree and control who can sign in and add data.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-6 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors duration-150 ${
              tab === t.key
                ? "border-green-600 text-green-700 dark:text-green-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "trees" && <AllTreesTab />}
      {tab === "types" && <TreeTypesTab />}
      {tab === "lists" && <FormSettingsTab />}
      {tab === "users" && <UsersTab />}
    </main>
  );
}

function AllTreesTab() {
  const confirmAction = useConfirm();
  const [trees, setTrees] = useState([]);
  const [loaded, setLoaded] = useState(false);

  function load() {
    getTrees()
      .then(setTrees)
      .finally(() => setLoaded(true));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(tree) {
    const confirmed = await confirmAction({
      title: `Delete ${tree.name}?`,
      message: "This can't be undone.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!confirmed) return;
    await deleteTree(tree.id);
    load();
  }

  if (!loaded) {
    return (
      <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <SpinnerIcon className="w-4 h-4" /> Loading trees...
      </p>
    );
  }

  if (trees.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        No trees have been added yet.
      </p>
    );
  }

  return (
    <>
      {/* Mobile: cards */}
      <div className="flex flex-col gap-2.5 sm:hidden">
        {trees.map((tree) => (
          <div
            key={tree.id}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 flex flex-col gap-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: tree.color || "#9ca3af" }}
                />
                <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                  {tree.name}
                </span>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <Link
                  href={`/tree/${tree.id}`}
                  aria-label={`View ${tree.name}`}
                  className="focus-ring rounded-lg flex items-center justify-center w-8 h-8 text-slate-400 dark:text-slate-500 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10"
                >
                  <TreeIcon className="w-4 h-4" />
                </Link>
                <Link
                  href={`/edit/${tree.id}`}
                  aria-label={`Edit ${tree.name}`}
                  className="focus-ring rounded-lg flex items-center justify-center w-8 h-8 text-slate-400 dark:text-slate-500 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10"
                >
                  <PencilIcon className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(tree)}
                  aria-label={`Delete ${tree.name}`}
                  className="focus-ring rounded-lg flex items-center justify-center w-8 h-8 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {tree.owner_name || "Unknown"} · {tree.location || "No location"}
            </p>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden sm:block overflow-x-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <th className="px-4 py-3 font-medium">Tree</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {trees.map((tree) => (
              <tr
                key={tree.id}
                className="border-b border-slate-100 dark:border-slate-700/60 last:border-0"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: tree.color || "#9ca3af" }}
                    />
                    <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                      {tree.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {tree.owner_name || "Unknown"}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                  {tree.location || "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-0.5">
                    <Link
                      href={`/tree/${tree.id}`}
                      aria-label={`View ${tree.name}`}
                      className="focus-ring rounded-lg flex items-center justify-center w-8 h-8 text-slate-400 dark:text-slate-500 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors duration-150"
                    >
                      <TreeIcon className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/edit/${tree.id}`}
                      aria-label={`Edit ${tree.name}`}
                      className="focus-ring rounded-lg flex items-center justify-center w-8 h-8 text-slate-400 dark:text-slate-500 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors duration-150"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(tree)}
                      aria-label={`Delete ${tree.name}`}
                      className="focus-ring rounded-lg flex items-center justify-center w-8 h-8 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-150"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function TreeTypesTab() {
  const confirmAction = useConfirm();
  const { categories, refresh: refreshReference } = useReferenceData();
  const [types, setTypes] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [savingName, setSavingName] = useState(null);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState(DEFAULT_CATEGORY);
  const [newColor, setNewColor] = useState(COLOR_PALETTE[0]);
  const [addBusy, setAddBusy] = useState(false);
  const [addError, setAddError] = useState("");

  function load() {
    getTreeTypes()
      .then(setTypes)
      .finally(() => setLoaded(true));
  }

  useEffect(() => {
    load();
    refreshReference();
  }, []);

  async function handleColorChange(type, nextColor) {
    setSavingName(type.name);
    try {
      await updateTreeType(type.name, { color: nextColor });
      setTypes((prev) =>
        prev.map((t) => (t.name === type.name ? { ...t, color: nextColor } : t))
      );
    } finally {
      setSavingName(null);
    }
  }

  async function handleCategoryChange(type, nextCategory) {
    setSavingName(type.name);
    try {
      await updateTreeType(type.name, { category: nextCategory });
      setTypes((prev) =>
        prev.map((t) => (t.name === type.name ? { ...t, category: nextCategory } : t))
      );
    } finally {
      setSavingName(null);
    }
  }

  async function handleAddType(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAddError("");
    setAddBusy(true);
    try {
      await addTreeType(newName, newCategory, newColor);
      setNewName("");
      setNewCategory(DEFAULT_CATEGORY);
      setNewColor(COLOR_PALETTE[0]);
      load();
    } catch (err) {
      setAddError(err.message || "Could not add that tree type.");
    } finally {
      setAddBusy(false);
    }
  }

  async function handleDeleteType(type) {
    const confirmed = await confirmAction({
      title: `Remove "${type.name}"?`,
      message:
        "Existing trees of this type keep their data but it won't be offered for new or edited trees.",
      confirmLabel: "Remove",
      danger: true,
    });
    if (!confirmed) return;
    await deleteTreeType(type.name);
    load();
  }

  if (!loaded) {
    return (
      <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <SpinnerIcon className="w-4 h-4" /> Loading tree types...
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Changing a type&apos;s color here instantly re-colors every tree of that
        type everywhere — cards, map, details.
      </p>

      <form
        onSubmit={handleAddType}
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-wrap items-end gap-3"
      >
        <input
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          aria-label="New tree type color"
          className="shrink-0 w-10 h-10 rounded-full ring-2 ring-slate-200 dark:ring-slate-600 cursor-pointer"
        />
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
            New tree type name
          </label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Sandalwood"
            className="focus-ring w-full min-h-[40px] border border-slate-300 dark:border-slate-600 rounded-xl px-3 text-sm bg-white dark:bg-slate-800 focus:border-green-500"
          />
        </div>
        <div className="min-w-[140px]">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
            Category
          </label>
          <div className="relative">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="focus-ring appearance-none w-full min-h-[40px] border border-slate-300 dark:border-slate-600 rounded-xl pl-3 pr-8 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        {addError && (
          <p className="w-full text-sm text-red-600 dark:text-red-400">{addError}</p>
        )}
        <button
          type="submit"
          disabled={addBusy}
          className="focus-ring flex items-center gap-1.5 min-h-[40px] px-4 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-70 transition-colors duration-150"
        >
          {addBusy ? <SpinnerIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
          {addBusy ? "Adding..." : "Add Tree Type"}
        </button>
      </form>

      {/* Mobile: cards */}
      <div className="flex flex-col gap-2.5 sm:hidden">
        {types.map((type) => (
          <div
            key={type.name}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 flex items-center gap-3"
          >
            <input
              type="color"
              value={type.color}
              onChange={(e) => handleColorChange(type, e.target.value)}
              aria-label={`${type.name} color`}
              className="shrink-0 w-9 h-9 rounded-full ring-2 ring-slate-200 dark:ring-slate-600 cursor-pointer"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                {type.name}
              </p>
              <div className="relative mt-1">
                <select
                  value={type.category || DEFAULT_CATEGORY}
                  onChange={(e) => handleCategoryChange(type, e.target.value)}
                  className="focus-ring appearance-none w-full border border-slate-300 dark:border-slate-600 rounded-lg pl-2 pr-6 py-1 text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="w-3 h-3 text-slate-400 dark:text-slate-500 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            {savingName === type.name && (
              <SpinnerIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            <button
              type="button"
              onClick={() => handleDeleteType(type)}
              aria-label={`Remove ${type.name}`}
              className="focus-ring shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-150"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden sm:block overflow-x-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Color</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {types.map((type) => (
              <tr
                key={type.name}
                className="border-b border-slate-100 dark:border-slate-700/60 last:border-0"
              >
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                  {type.name}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={type.color}
                      onChange={(e) => handleColorChange(type, e.target.value)}
                      aria-label={`${type.name} color`}
                      className="shrink-0 w-8 h-8 rounded-full ring-2 ring-slate-200 dark:ring-slate-600 cursor-pointer"
                    />
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      {type.color}
                    </span>
                    {savingName === type.name && (
                      <SpinnerIcon className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="relative inline-block">
                    <select
                      value={type.category || DEFAULT_CATEGORY}
                      onChange={(e) => handleCategoryChange(type, e.target.value)}
                      className="focus-ring appearance-none border border-slate-300 dark:border-slate-600 rounded-lg pl-2.5 pr-8 py-1.5 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {categories.map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleDeleteType(type)}
                    aria-label={`Remove ${type.name}`}
                    className="focus-ring flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-150"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Add Tree form settings: Category, Health Status, and Location Type lists.
// Each is a simple add/remove list — no table needed, so it's mobile-friendly
// by default.
function FormSettingsTab() {
  const { refresh } = useReferenceData();

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Control the options people see on the Add Tree form. Changes apply
        everywhere immediately — no app update needed.
      </p>
      <SimpleListEditor
        title="Categories"
        description="Shown when picking or creating a tree type."
        load={getCategories}
        add={(name) => addCategory(name)}
        update={(item, newName) => updateCategory(item.name, newName)}
        remove={(item) => deleteCategory(item.name)}
        itemKey={(item) => item.name}
        itemLabel={(item) => item.name}
        placeholder="New category name"
        onChange={refresh}
      />
      <HealthStatusEditor onChange={refresh} />
      <SimpleListEditor
        title="Location Types"
        description="Shown in the Location Type dropdown."
        load={getLocationTypes}
        add={(name) => addLocationType(name)}
        update={(item, newName) => updateLocationType(item.name, newName)}
        remove={(item) => deleteLocationType(item.name)}
        itemKey={(item) => item.name}
        itemLabel={(item) => item.name}
        placeholder="New location type"
        onChange={refresh}
      />
    </div>
  );
}

function SimpleListEditor({
  title,
  description,
  load,
  add,
  update,
  remove,
  itemKey,
  itemLabel,
  placeholder,
  onChange,
}) {
  const confirmAction = useConfirm();
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function refreshList() {
    load()
      .then(setItems)
      .finally(() => setLoaded(true));
  }

  useEffect(() => {
    refreshList();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newValue.trim()) return;
    setError("");
    setBusy(true);
    try {
      await add(newValue);
      setNewValue("");
      refreshList();
      onChange?.();
    } catch (err) {
      setError(err.message || "Could not add that.");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(item) {
    setEditingKey(itemKey(item));
    setEditValue(itemLabel(item));
    setError("");
  }

  async function saveEdit(item) {
    try {
      await update(item, editValue);
      setEditingKey(null);
      refreshList();
      onChange?.();
    } catch (err) {
      setError(err.message || "Could not rename that.");
    }
  }

  async function handleRemove(item) {
    const confirmed = await confirmAction({
      title: `Remove "${itemLabel(item)}"?`,
      confirmLabel: "Remove",
      danger: true,
    });
    if (!confirmed) return;
    try {
      await remove(item);
      refreshList();
      onChange?.();
    } catch (err) {
      setError(err.message || "Could not remove that.");
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
      <h2 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-3">
          {description}
        </p>
      )}

      {!loaded ? (
        <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <SpinnerIcon className="w-4 h-4" /> Loading...
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-700/60 border-y border-slate-100 dark:border-slate-700/60 mb-3">
          {items.length === 0 && (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-3">None yet.</p>
          )}
          {items.map((item) => {
            const key = itemKey(item);
            const isEditing = editingKey === key;
            return (
              <div key={key} className="flex items-center gap-2 py-2">
                {isEditing ? (
                  <>
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(item)}
                      className="focus-ring flex-1 min-w-0 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-sm bg-white dark:bg-slate-800 focus:border-green-500"
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit(item)}
                      aria-label="Save"
                      className="focus-ring text-green-700 dark:text-green-400"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingKey(null)}
                      aria-label="Cancel"
                      className="focus-ring text-slate-400"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-slate-700 dark:text-slate-200">
                      {itemLabel(item)}
                    </span>
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      aria-label={`Rename ${itemLabel(item)}`}
                      className="focus-ring flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors duration-150"
                    >
                      <PencilIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      aria-label={`Remove ${itemLabel(item)}`}
                      className="focus-ring flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-150"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder={placeholder}
          className="focus-ring flex-1 min-w-0 min-h-[38px] border border-slate-300 dark:border-slate-600 rounded-lg px-3 text-sm bg-white dark:bg-slate-800 focus:border-green-500"
        />
        <button
          type="submit"
          disabled={busy}
          className="focus-ring shrink-0 flex items-center gap-1 min-h-[38px] px-3 rounded-lg text-sm font-semibold text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 disabled:opacity-60 transition-colors duration-150"
        >
          <PlusIcon className="w-4 h-4" />
          Add
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

function HealthStatusEditor({ onChange }) {
  const confirmAction = useConfirm();
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [label, setLabel] = useState("");
  const [color, setColor] = useState("#22c55e");
  const [editingValue, setEditingValue] = useState(null);
  const [editLabel, setEditLabel] = useState("");
  const [editColor, setEditColor] = useState("#22c55e");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function refreshList() {
    getHealthStatuses()
      .then(setItems)
      .finally(() => setLoaded(true));
  }

  useEffect(() => {
    refreshList();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!label.trim()) return;
    setError("");
    setBusy(true);
    try {
      await addHealthStatus({ label, color });
      setLabel("");
      refreshList();
      onChange?.();
    } catch (err) {
      setError(err.message || "Could not add that.");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(item) {
    setEditingValue(item.value);
    setEditLabel(item.label);
    setEditColor(item.color);
    setError("");
  }

  async function saveEdit(item) {
    try {
      await updateHealthStatus(item.value, { label: editLabel, color: editColor });
      setEditingValue(null);
      refreshList();
      onChange?.();
    } catch (err) {
      setError(err.message || "Could not update that.");
    }
  }

  async function handleRemove(item) {
    const confirmed = await confirmAction({
      title: `Remove "${item.label}"?`,
      confirmLabel: "Remove",
      danger: true,
    });
    if (!confirmed) return;
    try {
      await deleteHealthStatus(item.value);
      refreshList();
      onChange?.();
    } catch (err) {
      setError(err.message || "Could not remove that.");
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
      <h2 className="font-semibold text-slate-900 dark:text-slate-100">
        Health Statuses
      </h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-3">
        Shown as the Health Status choices on the Add Tree form.
      </p>

      {!loaded ? (
        <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <SpinnerIcon className="w-4 h-4" /> Loading...
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-700/60 border-y border-slate-100 dark:border-slate-700/60 mb-3">
          {items.map((item) => {
            const isEditing = editingValue === item.value;
            return (
              <div key={item.value} className="flex items-center gap-2 py-2">
                {isEditing ? (
                  <>
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      aria-label={`${item.label} color`}
                      className="shrink-0 w-8 h-8 rounded-full ring-2 ring-slate-200 dark:ring-slate-600 cursor-pointer"
                    />
                    <input
                      autoFocus
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(item)}
                      className="focus-ring flex-1 min-w-0 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-sm bg-white dark:bg-slate-800 focus:border-green-500"
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit(item)}
                      aria-label="Save"
                      className="focus-ring text-green-700 dark:text-green-400"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingValue(null)}
                      aria-label="Cancel"
                      className="focus-ring text-slate-400"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="flex-1 text-sm text-slate-700 dark:text-slate-200">
                      {item.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      aria-label={`Edit ${item.label}`}
                      className="focus-ring flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors duration-150"
                    >
                      <PencilIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      aria-label={`Remove ${item.label}`}
                      className="focus-ring flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-150"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          aria-label="New health status color"
          className="shrink-0 w-9 h-9 rounded-full ring-2 ring-slate-200 dark:ring-slate-600 cursor-pointer"
        />
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="New status label"
          className="focus-ring flex-1 min-w-0 min-h-[38px] border border-slate-300 dark:border-slate-600 rounded-lg px-3 text-sm bg-white dark:bg-slate-800 focus:border-green-500"
        />
        <button
          type="submit"
          disabled={busy}
          className="focus-ring shrink-0 flex items-center gap-1 min-h-[38px] px-3 rounded-lg text-sm font-semibold text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 disabled:opacity-60 transition-colors duration-150"
        >
          <PlusIcon className="w-4 h-4" />
          Add
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

function UsersTab() {
  const confirmAction = useConfirm();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editFirst, setEditFirst] = useState("");
  const [editLast, setEditLast] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [accessBusyId, setAccessBusyId] = useState(null);
  const [resetBusyId, setResetBusyId] = useState(null);
  const [resetSentId, setResetSentId] = useState(null);
  const [deleteBusyId, setDeleteBusyId] = useState(null);
  const [error, setError] = useState("");

  function load() {
    const supabase = getSupabaseBrowserClient();
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setUsers(data || []))
      .finally(() => setLoaded(true));
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleRole(user) {
    const nextRole = user.role === "admin" ? "user" : "admin";
    const displayName = user.first_name || user.email;
    const confirmed = await confirmAction({
      title: nextRole === "admin" ? `Make ${displayName} an admin?` : `Remove admin access from ${displayName}?`,
      message:
        nextRole === "admin"
          ? "They'll be able to see and manage every user's trees."
          : undefined,
      confirmLabel: nextRole === "admin" ? "Make admin" : "Remove admin",
      danger: nextRole !== "admin",
    });
    if (!confirmed) return;
    const supabase = getSupabaseBrowserClient();
    await supabase.from("profiles").update({ role: nextRole }).eq("id", user.id);
    load();
  }

  function startEdit(user) {
    setEditingId(user.id);
    setEditFirst(user.first_name || "");
    setEditLast(user.last_name || "");
  }

  async function saveEdit(user) {
    const supabase = getSupabaseBrowserClient();
    await supabase
      .from("profiles")
      .update({ first_name: editFirst.trim(), last_name: editLast.trim() })
      .eq("id", user.id);
    setEditingId(null);
    load();
  }

  async function handleToggleAccess(user) {
    const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email;
    const revoke = !user.access_revoked;
    const confirmed = await confirmAction({
      title: revoke ? `Revoke access for ${displayName}?` : `Restore access for ${displayName}?`,
      message: revoke
        ? "They won't be able to sign in anymore. Their profile and every tree they've added stay exactly as they are — nothing is deleted."
        : "They'll be able to sign in again with their existing password.",
      confirmLabel: revoke ? "Revoke access" : "Restore access",
      danger: revoke,
    });
    if (!confirmed) return;

    setError("");
    setAccessBusyId(user.id);
    try {
      const res = await fetch("/api/admin/set-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, revoke }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Could not update their access.");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setAccessBusyId(null);
    }
  }

  async function handleResetPassword(user) {
    setError("");
    setResetBusyId(user.id);
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Could not send a reset email.");
      setResetSentId(user.id);
      setTimeout(() => setResetSentId(null), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setResetBusyId(null);
    }
  }

  async function handleDeleteUser(user) {
    const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email;
    const confirmed = await confirmAction({
      title: `Delete ${displayName}?`,
      message:
        "Their login and profile are permanently deleted — this can't be undone. Every tree they've added stays in the database, still showing their name. If they're invited again with the same email, their trees automatically become theirs again.",
      confirmLabel: "Delete user",
      danger: true,
    });
    if (!confirmed) return;

    setError("");
    setDeleteBusyId(user.id);
    try {
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Could not delete this user.");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteBusyId(null);
    }
  }

  function RoleBadge({ user }) {
    return (
      <button
        type="button"
        onClick={() => toggleRole(user)}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors duration-150 ${
          user.role === "admin"
            ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400"
            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
        }`}
      >
        {user.role === "admin" && <ShieldIcon className="w-3 h-3" />}
        {user.role === "admin" ? "Admin" : "User"}
      </button>
    );
  }

  function StatusBadge({ user }) {
    if (!user.access_revoked) return null;
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400">
        <LockIcon className="w-3 h-3" />
        Access revoked
      </span>
    );
  }

  function AccessButtons({ user }) {
    if (user.id === currentUser?.id) return null;
    const isRevoked = !!user.access_revoked;
    return (
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => handleResetPassword(user)}
          disabled={resetBusyId === user.id}
          aria-label={`Send password reset to ${user.first_name || user.email}`}
          title="Send password reset email"
          className="focus-ring flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 dark:text-slate-500 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 disabled:opacity-50 transition-colors duration-150"
        >
          {resetBusyId === user.id ? (
            <SpinnerIcon className="w-3.5 h-3.5" />
          ) : resetSentId === user.id ? (
            <CheckCircleIcon className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
          ) : (
            <MailIcon className="w-3.5 h-3.5" />
          )}
        </button>
        <button
          type="button"
          onClick={() => handleToggleAccess(user)}
          disabled={accessBusyId === user.id}
          aria-label={
            isRevoked
              ? `Restore access for ${user.first_name || user.email}`
              : `Revoke access for ${user.first_name || user.email}`
          }
          title={isRevoked ? "Restore access" : "Revoke access"}
          className={`focus-ring flex items-center justify-center w-8 h-8 rounded-lg disabled:opacity-50 transition-colors duration-150 ${
            isRevoked
              ? "text-slate-400 dark:text-slate-500 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10"
              : "text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
          }`}
        >
          {accessBusyId === user.id ? (
            <SpinnerIcon className="w-3.5 h-3.5" />
          ) : isRevoked ? (
            <UnlockIcon className="w-3.5 h-3.5" />
          ) : (
            <LockIcon className="w-3.5 h-3.5" />
          )}
        </button>
        <button
          type="button"
          onClick={() => handleDeleteUser(user)}
          disabled={deleteBusyId === user.id}
          aria-label={`Delete ${user.first_name || user.email}`}
          title="Delete user (keeps their trees)"
          className="focus-ring flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50 transition-colors duration-150"
        >
          {deleteBusyId === user.id ? (
            <SpinnerIcon className="w-3.5 h-3.5" />
          ) : (
            <TrashIcon className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    );
  }

  function NameEditor({ user }) {
    if (editingId !== user.id) {
      return (
        <div className="flex items-center gap-1.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 shrink-0">
            <UserIcon className="w-3.5 h-3.5" />
          </span>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {[user.first_name, user.last_name].filter(Boolean).join(" ") || "—"}
          </span>
          <button
            type="button"
            onClick={() => startEdit(user)}
            aria-label="Edit name"
            className="focus-ring text-slate-400 hover:text-green-700 dark:hover:text-green-400 transition-colors duration-150"
          >
            <PencilIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <input
          autoFocus
          value={editFirst}
          onChange={(e) => setEditFirst(e.target.value)}
          placeholder="First name"
          className="focus-ring w-24 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-slate-800"
        />
        <input
          value={editLast}
          onChange={(e) => setEditLast(e.target.value)}
          placeholder="Last name"
          className="focus-ring w-24 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-slate-800"
        />
        <button
          type="button"
          onClick={() => saveEdit(user)}
          aria-label="Save name"
          className="focus-ring text-green-700 dark:text-green-400"
        >
          <CheckCircleIcon className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => setEditingId(null)}
          aria-label="Cancel"
          className="focus-ring text-slate-400"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowInvite((v) => !v)}
          className="focus-ring flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 active:bg-green-800 transition-colors duration-150"
        >
          <UserPlusIcon className="w-4 h-4" />
          {showInvite ? "Close" : "Invite User"}
        </button>
      </div>

      {showInvite && (
        <InviteForm
          onInvited={() => {
            setShowInvite(false);
            load();
          }}
        />
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {!loaded ? (
        <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <SpinnerIcon className="w-4 h-4" /> Loading users...
        </p>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="flex flex-col gap-2.5 sm:hidden">
            {users.map((u) => (
              <div
                key={u.id}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <NameEditor user={u} />
                  <AccessButtons user={u} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <RoleBadge user={u} />
                  <StatusBadge user={u} />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block overflow-x-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-100 dark:border-slate-700/60 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <NameEditor user={u} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {u.email}
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge user={u} />
                    </td>
                    <td className="px-4 py-3">
                      {u.access_revoked ? (
                        <StatusBadge user={u} />
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <AccessButtons user={u} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function InviteForm({ onInvited }) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/invite-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, lastName }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Could not invite that user.");
      onInvited();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-wrap items-end gap-3"
    >
      <div className="flex-1 min-w-[140px]">
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
          First name
        </label>
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="focus-ring w-full min-h-[40px] border border-slate-300 dark:border-slate-600 rounded-xl px-3 text-sm bg-white dark:bg-slate-800"
        />
      </div>
      <div className="flex-1 min-w-[140px]">
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
          Last name
        </label>
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="focus-ring w-full min-h-[40px] border border-slate-300 dark:border-slate-600 rounded-xl px-3 text-sm bg-white dark:bg-slate-800"
        />
      </div>
      <div className="flex-[2] min-w-[200px]">
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="focus-ring w-full min-h-[40px] border border-slate-300 dark:border-slate-600 rounded-xl px-3 text-sm bg-white dark:bg-slate-800"
        />
      </div>
      {error && (
        <p className="w-full text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="focus-ring flex items-center gap-1.5 min-h-[40px] px-4 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-70 transition-colors duration-150"
      >
        {loading && <SpinnerIcon className="w-4 h-4" />}
        {loading ? "Sending invite..." : "Send invite"}
      </button>
    </form>
  );
}
