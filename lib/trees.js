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
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trees));
  } catch (err) {
    if (err instanceof DOMException && err.name === "QuotaExceededError") {
      throw new Error(
        "Storage is full. Delete a few trees (especially ones with photos) and try again."
      );
    }
    throw err;
  }
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

export function deleteTree(id) {
  writeAll(readAll().filter((t) => t.id !== id));
}

// Returns the first image for a tree, falling back to the legacy single
// `image_url` field for trees saved before multi-photo support was added.
export function getCoverImage(tree) {
  return tree.images?.[0] || tree.image_url || null;
}

// Converts an uploaded image file to a base64 data URL for local storage,
// downscaling and re-compressing it first. A phone camera photo can be
// several MB at full resolution — way more than localStorage can hold for
// more than a couple of trees — so this keeps each photo to roughly
// 100-300KB without a visible quality loss at the sizes we display it.
// Later this becomes: upload the original file to Supabase Storage instead.
export function fileToDataUrl(file, { maxDimension = 1280, quality = 0.75 } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Could not read that image."));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}
