// One-time demo data so a freshly opened app (e.g. right after deploying)
// has realistic content to show instead of an empty list. Only runs once —
// guarded by a flag in localStorage — and never re-populates after that,
// even if the user deletes everything.

import { addTreeType } from "@/lib/treeTypes";

const SEEDED_FLAG = "vagdo_seeded";
const STORAGE_KEY = "vagdo_trees";

const SPECIES = [
  { name: "Neem", color: "#22c55e" },
  { name: "Mango", color: "#f97316" },
  { name: "Banyan", color: "#ef4444" },
  { name: "Peepal", color: "#3b82f6" },
  { name: "Coconut", color: "#a855f7" },
  { name: "Gulmohar", color: "#eab308" },
  { name: "Teak", color: "#14b8a6" },
  { name: "Amla", color: "#ec4899" },
  { name: "Jamun", color: "#84cc16" },
  { name: "Ashoka", color: "#06b6d4" },
];

const CITIES = [
  { city: "Ahmedabad, Gujarat", lat: 23.0225, lng: 72.5714 },
  { city: "Surat, Gujarat", lat: 21.1702, lng: 72.8311 },
  { city: "Mumbai, Maharashtra", lat: 19.076, lng: 72.8777 },
  { city: "Pune, Maharashtra", lat: 18.5204, lng: 73.8567 },
  { city: "Delhi", lat: 28.7041, lng: 77.1025 },
  { city: "Jaipur, Rajasthan", lat: 26.9124, lng: 75.7873 },
  { city: "Bengaluru, Karnataka", lat: 12.9716, lng: 77.5946 },
  { city: "Chennai, Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { city: "Hyderabad, Telangana", lat: 17.385, lng: 78.4867 },
  { city: "Kolkata, West Bengal", lat: 22.5726, lng: 88.3639 },
  { city: "Lucknow, Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  { city: "Nagpur, Maharashtra", lat: 21.1458, lng: 79.0882 },
];

const NOTES = [
  "Planted during the monsoon drive.",
  "Doing well, good canopy growth.",
  "Needs occasional watering in summer.",
  "Community planting at the local park.",
  "Grown from a sapling donated by the forest department.",
  "Near the school compound wall.",
  "Part of the riverside greening project.",
];

const HEALTH_WEIGHTS = [
  "healthy",
  "healthy",
  "healthy",
  "needs_attention",
  "needs_attention",
  "dead",
  null,
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPastDate(maxDaysAgo) {
  const daysAgo = Math.floor(Math.random() * maxDaysAgo);
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
}

function jitter(value, amount) {
  return value + (Math.random() - 0.5) * amount;
}

// Static illustration files in /public/seed-images (one per species, e.g.
// neem.svg) — served locally from this app, so seed photos never depend on
// an external image service that can go down or return unrelated photos.
function seedImagePath(speciesName) {
  return `/seed-images/${speciesName.toLowerCase()}.svg`;
}

function generateSeedTrees(count = 50) {
  return Array.from({ length: count }, (_, i) => {
    const species = SPECIES[i % SPECIES.length];
    const city = randomItem(CITIES);
    const hasLocation = Math.random() < 0.8;

    return {
      id: crypto.randomUUID(),
      name: species.name,
      color: species.color,
      location: hasLocation ? city.city : null,
      latitude: hasLocation ? jitter(city.lat, 0.3) : null,
      longitude: hasLocation ? jitter(city.lng, 0.3) : null,
      images: [seedImagePath(species.name)],
      description: Math.random() < 0.35 ? randomItem(NOTES) : null,
      health: randomItem(HEALTH_WEIGHTS),
      created_at: randomPastDate(730), // up to 2 years old
    };
  });
}

// Wipes all app data (trees, custom tree types, and the seeded flag) and
// reloads, so the demo data populates fresh. Used by the in-app "Reset data"
// option — the only practical way to clear this on a phone, where there's
// no DevTools console to run localStorage.clear() from.
export function resetAllData() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(SEEDED_FLAG);
  window.localStorage.removeItem("vagdo_tree_types");
  window.location.reload();
}

export function seedDemoDataIfNeeded() {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem(SEEDED_FLAG)) return;

    const existingRaw = window.localStorage.getItem(STORAGE_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    if (existing.length === 0) {
      const demoTrees = generateSeedTrees(50);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(demoTrees));
      SPECIES.forEach((s) => addTreeType(s.name));
    }

    window.localStorage.setItem(SEEDED_FLAG, "true");
  } catch {
    // localStorage unavailable — skip seeding silently
  }
}
