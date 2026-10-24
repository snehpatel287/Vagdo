import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/serverClient";
import { getSupabaseAdminClient } from "@/lib/supabase/adminClient";

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

  const { userId } = await request.json();
  if (!userId) {
    return NextResponse.json({ error: "User id is required." }, { status: 400 });
  }
  if (userId === user.id) {
    return NextResponse.json(
      { error: "You can't delete your own account." },
      { status: 400 }
    );
  }

  const admin = getSupabaseAdminClient();
  // Cascades: the user's profile row and every tree they own are deleted
  // along with them (trees.user_id / profiles.id both reference
  // auth.users(id) on delete cascade).
  const { error } = await admin.auth.admin.deleteUser(userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
