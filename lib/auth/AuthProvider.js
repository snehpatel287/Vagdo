"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid) => {
    if (!uid) {
      setProfile(null);
      return;
    }
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .single();
    setProfile(data || null);
  }, []);

  // Safety net for invite/magic-link emails: they should redirect through
  // /auth/callback, but if a Supabase project's Redirect URL allowlist
  // doesn't exactly match our redirectTo, Supabase silently falls back to
  // the Site URL root instead — landing here (or anywhere) with the
  // session tokens still sitting in the URL hash. Fragments never reach
  // the server, so proxy.js can't catch this; this client-side check runs
  // on every page and rescues the tokens wherever they end up.
  useEffect(() => {
    if (
      window.location.hash.includes("access_token") &&
      window.location.pathname !== "/set-password"
    ) {
      router.replace(`/set-password${window.location.hash}`);
    }
  }, [router]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let active = true;

    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      setUser(data.user || null);
      await loadProfile(data.user?.id);
      if (active) setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user || null);
        await loadProfile(session?.user?.id);
      }
    );

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [loadProfile]);

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
