// Tree health statuses (Healthy, Needs attention, ...) — shared, admin-managed.
// RLS: anyone signed in can read; only admin can insert/update/delete.

import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

export async function getHealthStatuses() {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("health_statuses")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data;
}

export async function addHealthStatus({ label, color }) {
  const trimmedLabel = label.trim();
  if (!trimmedLabel) return null;
  const value = trimmedLabel.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("health_statuses")
    .insert({ value, label: trimmedLabel, color: color || "#64748b" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateHealthStatus(value, { label, color }) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("health_statuses")
    .update({
      ...(label ? { label } : {}),
      ...(color ? { color } : {}),
    })
    .eq("value", value)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteHealthStatus(value) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("health_statuses").delete().eq("value", value);
  if (error) throw error;
}
