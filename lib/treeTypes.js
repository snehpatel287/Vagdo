// Local list of tree species with an assigned color, used to populate the
// dropdown on the Add Tree form. Stored in localStorage so custom types a
// user adds stick around. Later this becomes a `tree_types` Supabase table.

const STORAGE_KEY = "vagdo_tree_types";

export const COLOR_PALETTE = [
  "#22c55e", // green
  "#f97316", // orange
  "#ef4444", // red
  "#3b82f6", // blue
  "#a855f7", // purple
  "#eab308", // yellow
  "#14b8a6", // teal
  "#ec4899", // pink
  "#84cc16", // lime
  "#06b6d4", // cyan
];

export const DEFAULT_CATEGORY = "Other";

export const CATEGORIES = [
  "Fruit",
  "Shade",
  "Flowering",
  "Timber",
  "Medicinal",
  DEFAULT_CATEGORY,
];

const DEFAULT_TYPES = [
  { name: "Neem", category: "Medicinal" },
  { name: "Mango", category: "Fruit" },
  { name: "Banyan", category: "Shade" },
  { name: "Peepal", category: "Shade" },
  { name: "Coconut", category: "Fruit" },
  { name: "Gulmohar", category: "Flowering" },
  { name: "Teak", category: "Timber" },
].map(({ name, category }, i) => ({
  name,
  category,
  color: COLOR_PALETTE[i % COLOR_PALETTE.length],
}));

function readAll() {
  if (typeof window === "undefined") return DEFAULT_TYPES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      writeAll(DEFAULT_TYPES);
      return DEFAULT_TYPES;
    }
    // Types saved before categories existed won't have one yet — treat
    // those as "Other" rather than leaving them unfilterable.
    return JSON.parse(raw).map((t) => ({
      ...t,
      category: t.category || DEFAULT_CATEGORY,
    }));
  } catch {
    return DEFAULT_TYPES;
  }
}

function writeAll(types) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(types));
}

export function getTreeTypes() {
  return readAll();
}

export function addTreeType(name, category, color) {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const types = readAll();
  const existing = types.find(
    (t) => t.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (existing) return existing;

  const type = {
    name: trimmed,
    category: category || DEFAULT_CATEGORY,
    color: color || COLOR_PALETTE[types.length % COLOR_PALETTE.length],
  };
  types.push(type);
  writeAll(types);
  return type;
}
