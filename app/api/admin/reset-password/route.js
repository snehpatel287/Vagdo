import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/serverClient";

// Sends the target user a password-reset email so they can set a new
// password without needing a fresh invite. Uses Supabase's built-in
// recovery email — it lands on /auth/callback -> /set-password, same as
// the invite flow.
export async function POST(request) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 403 }
    );
  }

  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback`,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
