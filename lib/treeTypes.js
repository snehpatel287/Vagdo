// Local list of tree species with an assigned color, used to populate the
// dropdown on the Add Tree form. Stored in localStorage so custom types a
// user adds stick around. Later this becomes a `tree_types` Supabase table.

const STORAGE_KEY = "vagdo_tree_types";

const COLOR_PALETTE = [
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

const DEFAULT_TYPES = [
  "Neem",
  "Mango",
  "Banyan",
  "Peepal",
  "Coconut",
  "Gulmohar",
  "Teak",
].map((name, i) => ({ name, color: COLOR_PALETTE[i % COLOR_PALETTE.length] }));

function readAll() {
  if (typeof window === "undefined") return DEFAULT_TYPES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      writeAll(DEFAULT_TYPES);
      return DEFAULT_TYPES;
    }
    return JSON.parse(raw);
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

export function addTreeType(name) {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const types = readAll();
  const existing = types.find(
    (t) => t.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (existing) return existing;

  const color = COLOR_PALETTE[types.length % COLOR_PALETTE.length];
  const type = { name: trimmed, color };
  types.push(type);
  writeAll(types);
  return type;
}
