// Local-only "database" using localStorage.
// Shape mirrors the future Supabase `trees` table so swapping it out later is a drop-in change:
// { id, name, location, images, health, created_at }

const STORAGE_KEY = "vagdo_trees";

export const HEALTH_STATUSES = [
  { value: "healthy", label: "Healthy", color: "#22c55e" },
  { value: "needs_attention", label: "Needs attention", color: "#f59e0b" },
  { value: "dead", label: "Dead", color: "#ef4444" },
];

function readAll() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(trees) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trees));
}

export function getTrees() {
  return readAll().sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
}

export function addTree({
  name,
  color,
  location,
  latitude,
  longitude,
  images,
  description,
  health,
}) {
  const trees = readAll();
  const tree = {
    id: crypto.randomUUID(),
    name,
    color: color || null,
    location: location || null,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
    images: Array.isArray(images) ? images : [],
    description: description?.trim() || null,
    health: health || null,
    created_at: new Date().toISOString(),
  };
  trees.push(tree);
  writeAll(trees);
  return tree;
}

export function getTree(id) {
  return readAll().find((t) => t.id === id) || null;
}

export function updateTree(
  id,
  {
    name,
    color,
    location,
    latitude,
    longitude,
    images,
    description,
    health,
  }
) {
  const trees = readAll();
  const index = trees.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const updated = {
    ...trees[index],
    name,
    color: color || null,
    location: location || null,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
    images: Array.isArray(images) ? images : trees[index].images || [],
    description: description?.trim() || null,
    health: health || null,
  };
  trees[index] = updated;
  writeAll(trees);
  return updated;
}

export function duplicateTree(id) {
  const trees = readAll();
  const source = trees.find((t) => t.id === id);
  if (!source) return null;

  const copy = {
    ...source,
    id: crypto.randomUUID(),
    name: source.name,
    created_at: new Date().toISOString(),
  };
  trees.push(copy);
  writeAll(trees);
  return copy;
}

export function deleteTree(id) {
  writeAll(readAll().filter((t) => t.id !== id));
}

// Returns the first image for a tree, falling back to the legacy single
// `image_url` field for trees saved before multi-photo support was added.
export function getCoverImage(tree) {
  return tree.images?.[0] || tree.image_url || null;
}

// Converts an uploaded image file to a base64 data URL for local storage.
// Later this becomes: upload file to Supabase Storage, store the public URL instead.
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
