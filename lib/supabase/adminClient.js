import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses Row Level Security entirely. Only ever
// import this from server-side code (Route Handlers), and only after
// verifying the caller is an admin via getSupabaseServerClient(). The
// `server-only` import makes it a build error to accidentally pull this
// into a Client Component bundle.
export function getSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
