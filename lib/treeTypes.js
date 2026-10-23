// Tree species shared across every user, backed by Supabase. Anyone signed
// in can read the list; adding a new type requires the same `can_add_tree`
// permission as adding a tree (enforced by RLS — see supabase/schema.sql).

import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

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

// Fallback shown when a type has no category — the selectable list itself is
// admin-managed now (lib/categories.js, useReferenceData()).
export const DEFAULT_CATEGORY = "Other";

export async function getTreeTypes() {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("tree_types")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
}

export async function addTreeType(name, category, color) {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const supabase = getSupabaseBrowserClient();

  const { data: existing } = await supabase
    .from("tree_types")
    .select("*")
    .ilike("name", trimmed)
    .maybeSingle();
  if (existing) return existing;

  const { count } = await supabase
    .from("tree_types")
    .select("*", { count: "exact", head: true });

  const { data, error } = await supabase
    .from("tree_types")
    .insert({
      name: trimmed,
      category: category || DEFAULT_CATEGORY,
      color: color || COLOR_PALETTE[(count || 0) % COLOR_PALETTE.length],
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Admin-only (enforced by RLS) — changing a type's color here re-colors
// every tree of that type everywhere, since display color is always
// resolved live from this table rather than stored per-tree.
export async function updateTreeType(name, { category, color }) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("tree_types")
    .update({
      ...(category ? { category } : {}),
      ...(color ? { color } : {}),
    })
    .eq("name", name)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Admin-only (enforced by RLS). Existing trees already saved with this type
// name are untouched — they just won't be offered as a selectable type for
// new/edited trees anymore.
export async function deleteTreeType(name) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("tree_types").delete().eq("name", name);
  if (error) throw error;
}
