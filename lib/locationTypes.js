// Tree location types (Roadside, Farm, ...) — shared, admin-managed list.
// RLS: anyone signed in can read; only admin can insert/update/delete.

import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

export async function getLocationTypes() {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("location_types")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data;
}

export async function addLocationType(name) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("location_types")
    .insert({ name: trimmed })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteLocationType(name) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("location_types").delete().eq("name", name);
  if (error) throw error;
}

// Renames the location type and re-points every tree that used the old name
// so nothing is left referencing a location type that no longer exists.
export async function updateLocationType(oldName, newName) {
  const trimmed = newName.trim();
  if (!trimmed || trimmed === oldName) return null;
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("location_types")
    .update({ name: trimmed })
    .eq("name", oldName)
    .select()
    .single();
  if (error) throw error;
  await supabase.from("trees").update({ location_type: trimmed }).eq("location_type", oldName);
  return data;
}
