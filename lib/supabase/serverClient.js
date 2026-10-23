import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// For use in Server Components, Server Actions, and Route Handlers. Reads
// the session from cookies; writes are a no-op when called from a Server
// Component (Next.js forbids setting cookies during render) — the proxy
// (middleware) is what actually keeps the session cookie refreshed.
export async function getSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component render — safe to ignore,
            // the proxy refreshes the session cookie on navigation.
          }
        },
      },
    }
  );
}
