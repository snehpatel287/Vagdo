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

  const { email, firstName, lastName } = await request.json();
  if (!email?.trim()) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;

  const { data, error } = await admin.auth.admin.inviteUserByEmail(
    email.trim(),
    {
      redirectTo: `${siteUrl}/auth/callback`,
      data: {
        first_name: firstName?.trim() || "",
        last_name: lastName?.trim() || "",
      },
    }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ user: data.user });
}
