import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/serverClient";
import { getSupabaseAdminClient } from "@/lib/supabase/adminClient";

// Revokes or restores a user's ability to sign in, WITHOUT deleting their
// account, profile, or any trees they've added. Revoking bans the auth
// account (Supabase rejects login attempts) — all their data stays exactly
// as it was, including their name showing as the owner on their trees.
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

  const { userId, revoke } = await request.json();
  if (!userId) {
    return NextResponse.json({ error: "User id is required." }, { status: 400 });
  }
  if (userId === user.id) {
    return NextResponse.json(
      { error: "You can't change your own access." },
      { status: 400 }
    );
  }

  const admin = getSupabaseAdminClient();
  // "876000h" (~100 years) is the conventional "effectively permanent" ban
  // duration for Supabase Auth; "none" lifts an existing ban.
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: revoke ? "876000h" : "none",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.from("profiles").update({ access_revoked: !!revoke }).eq("id", userId);

  return NextResponse.json({ ok: true });
}
