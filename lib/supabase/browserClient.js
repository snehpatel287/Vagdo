"use client";

import { createBrowserClient } from "@supabase/ssr";

let client;

// One shared client per browser tab — createBrowserClient() is cheap but
// there's no reason to spin up a new one on every call site.
export function getSupabaseBrowserClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return client;
}
