// Supabase-backed tree records. Row Level Security on the `trees` table
// does the access filtering: a regular user only ever gets their own rows
// back from `select`, an admin gets everyone's. See supabase/schema.sql.

import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

// Health statuses and location types are admin-managed lists now — see
// lib/healthStatuses.js, lib/locationTypes.js, and useReferenceData().

// Color belongs to the tree TYPE, not the individual tree — every tree of a
// given species always shows that species' current color. Trees still carry
// a `color` column (handy for direct SQL/export), but the app always
// resolves display color live from `tree_types` so changing a type's color
// instantly re-colors every tree of that type, past and future.
async function colorByTypeName() {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.from("tree_types").select("name, color");
  if (error) throw error;
  const map = {};
  (data || []).forEach((t) => {
    map[t.name] = t.color;
  });
  return map;
}

// A regular user's `profiles` select only ever returns their own row (RLS),
// which is fine — all of their trees are theirs anyway. An admin's select
// returns everyone's, so every tree's real owner resolves correctly.
async function ownerByUserId() {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email");
  if (error) throw error;
  const map = {};
  (data || []).forEach((p) => {
    map[p.id] = {
      name: [p.first_name, p.last_name].filter(Boolean).join(" ") || p.email,
      email: p.email,
    };
  });
  return map;
}

function withResolved(tree, colorMap, ownerMap) {
  const owner = ownerMap[tree.user_id];
  return {
    ...tree,
    color: colorMap[tree.name] || tree.color,
    owner_name: owner?.name || null,
    owner_email: owner?.email || null,
  };
}

export async function getTrees() {
  const supabase = getSupabaseBrowserClient();
  const [{ data, error }, colorMap, ownerMap] = await Promise.all([
    supabase.from("trees").select("*").order("created_at", { ascending: false }),
    colorByTypeName(),
    ownerByUserId(),
  ]);
  if (error) throw error;
  return data.map((t) => withResolved(t, colorMap, ownerMap));
}

export async function getTree(id) {
  const supabase = getSupabaseBrowserClient();
  const [{ data, error }, colorMap, ownerMap] = await Promise.all([
    supabase.from("trees").select("*").eq("id", id).maybeSingle(),
    colorByTypeName(),
    ownerByUserId(),
  ]);
  if (error) throw error;
  return data ? withResolved(data, colorMap, ownerMap) : data;
}

export async function addTree({
  name,
  location,
  latitude,
  longitude,
  images,
  description,
  health,
  locationType,
  hasBirdNesting,
}) {
  const supabase = getSupabaseBrowserClient();
  const { data: type } = await supabase
    .from("tree_types")
    .select("color")
    .eq("name", name)
    .maybeSingle();

  const { data, error } = await supabase
    .from("trees")
    .insert({
      name,
      color: type?.color || null,
      location: location || null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      images: Array.isArray(images) ? images : [],
      description: description?.trim() || null,
      health: health || null,
      location_type: locationType || null,
      has_bird_nesting: hasBirdNesting ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTree(
  id,
  {
    name,
    location,
    latitude,
    longitude,
    images,
    description,
    health,
    locationType,
    hasBirdNesting,
  }
) {
  const supabase = getSupabaseBrowserClient();
  const { data: type } = await supabase
    .from("tree_types")
    .select("color")
    .eq("name", name)
    .maybeSingle();

  const { data, error } = await supabase
    .from("trees")
    .update({
      name,
      color: type?.color || null,
      location: location || null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      images: Array.isArray(images) ? images : undefined,
      description: description?.trim() || null,
      health: health || null,
      location_type: locationType || null,
      has_bird_nesting: hasBirdNesting ?? null,
    })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function deleteTree(id) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("trees").delete().eq("id", id);
  if (error) throw error;
}

// Returns the first image for a tree, falling back to the legacy single
// `image_url` field for trees saved before multi-photo support was added.
export function getCoverImage(tree) {
  return tree.images?.[0] || tree.image_url || null;
}

const BUCKET = "tree-photos";

// Downscales/recompresses the image client-side (a phone photo can be
// several MB — no reason to upload more than we'll ever display), then
// uploads it to the current user's folder in Supabase Storage and returns
// the public URL to store on the tree record.
export async function uploadTreeImage(
  file,
  { maxDimension = 1280, quality = 0.75 } = {}
) {
  const blob = await resizeImage(file, maxDimension, quality);

  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in to upload photos.");

  const path = `${user.id}/${crypto.randomUUID()}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return publicUrl;
}

function resizeImage(file, maxDimension, quality) {
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
        canvas.toBlob(
          (blob) =>
            blob
              ? resolve(blob)
              : reject(new Error("Could not process that image.")),
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Could not read that image."));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}
