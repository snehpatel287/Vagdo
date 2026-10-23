// Tree-type categories (Fruit, Shade, ...) — shared, admin-managed list.
// RLS: anyone signed in can read; only admin can insert/update/delete.

import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

export async function getCategories() {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data;
}

export async function addCategory(name) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({ name: trimmed })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(name) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("categories").delete().eq("name", name);
  if (error) throw error;
}

// Renames the category and re-points every tree type that used the old name
// so nothing is left referencing a category that no longer exists.
export async function updateCategory(oldName, newName) {
  const trimmed = newName.trim();
  if (!trimmed || trimmed === oldName) return null;
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("categories")
    .update({ name: trimmed })
    .eq("name", oldName)
    .select()
    .single();
  if (error) throw error;
  await supabase.from("tree_types").update({ category: trimmed }).eq("category", oldName);
  return data;
}
